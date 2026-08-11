---
title: drei
published: true
category: react-three-fiber
subtitle: controls, Environment, shadow, Html, 성능 컴포넌트
date: 2026-08-10
---

독일어 drei(3)에서 이름을 딴, R3F용 헬퍼 모음이다. 바닐라 three.js에서 매번 직접 짜던 것들이 컴포넌트로 정리되어 있다. 사실상 R3F와 세트로 쓴다.

```bash
npm install @react-three/drei
```

## 카메라 컨트롤

---

```jsx
import { OrbitControls } from '@react-three/drei';

<OrbitControls
  makeDefault
  enableDamping           // 기본 true. 관성
  dampingFactor={0.05}
  minDistance={2}
  maxDistance={20}
  minPolarAngle={0}
  maxPolarAngle={Math.PI / 2}   // 바닥 아래로 못 내려가게
  enablePan={false}
  target={[0, 1, 0]}
/>
```

`makeDefault`는 이 컨트롤을 `state.controls`에 등록해서, drei의 다른 컴포넌트들이 "현재 컨트롤"을 인지할 수 있게 해준다. 예를 들어 `Bounds`가 카메라를 옮길 때 컨트롤의 target도 같이 맞춰주려면 이 등록이 필요하다. **특별한 이유가 없으면 항상 붙이는 편이 낫다.**

| 컴포넌트 | 용도 |
| --- | --- |
| `OrbitControls` | 기본. 대상 중심 궤도 |
| `MapControls` | 팬 중심. 지도, 평면 뷰 |
| `TrackballControls` | 상하 제한 없는 자유 회전 |
| `FlyControls` / `FirstPersonControls` | 1인칭 이동 |
| `CameraControls` | 강력함. 부드러운 전환, `fitToBox`, 프로그래밍 제어 |
| `PresentationControls` | 회전 각도가 제한된 쇼케이스 느낌 |

`enableDamping`이 켜져 있으면 마우스를 놓은 뒤에도 관성으로 조금 더 움직인다. 이 말은 곧 **`frameloop="demand"`와 함께 쓸 때 감쇠가 끝날 때까지 계속 그려야 한다**는 뜻인데, drei가 내부에서 `invalidate`를 불러주므로 신경 쓸 일은 없다.

## 조명

---

```jsx
import { Environment } from '@react-three/drei';

{/* 배경으로도 사용 */}
<Environment preset="sunset" background blur={0.5} />

{/* 로컬 HDRI 파일 */}
<Environment files="/hdri/studio.hdr" />

{/* 직접 배치한 조명을 HDRI로 구워서 사용 */}
<Environment>
  <mesh scale={100} position={[0, 5, -10]}>
    <planeGeometry args={[10, 10]} />
    <meshBasicMaterial color="white" />
  </mesh>
</Environment>
```

`Environment` 하나로 key, fill, rim 조명을 전부 대체하고 금속 재질의 반사까지 자동으로 채워준다. [material](/posts/material)에서 정리했듯이 `metalness`가 1인 재질은 반사할 환경이 없으면 검게 보이는데, 이걸 넣는 순간 해결된다.

프리셋 종류는 `apartment`, `city`, `dawn`, `forest`, `lobby`, `night`, `park`, `studio`, `sunset`, `warehouse`다.

**preset은 CDN에서 HDRI를 내려받는 방식이라, 배포할 때는 로컬 파일로 바꿔야 한다.** 외부 CDN에 의존하면 오프라인에서 깨지고, 로딩 시간도 통제할 수 없다. HDRI 파일은 수 MB씩 나가는 경우가 많으니 해상도도 함께 확인한다.

세 번째 형태는 조명을 직접 배치해서 환경 맵으로 굽는 것이다. 스튜디오 조명을 정확히 통제하고 싶을 때 쓴다. 한 번 구워두면 이후에는 텍스처 샘플링이라 조명 개수만큼의 비용이 들지 않는다.

## 그림자

---

```jsx
import { ContactShadows, SoftShadows } from '@react-three/drei';

{/* 가볍고 예쁨. 객체 아래 접지 그림자를 렌더 타겟에 굽는 방식 */}
<ContactShadows position={[0, -1, 0]} opacity={0.5} scale={10} blur={2} far={4} />

{/* 실제 섀도우 맵을 부드럽게 (PCSS). 비용 있음 */}
<SoftShadows size={25} samples={16} />
```

종류는 `ContactShadows`, `SoftShadows`, `AccumulativeShadows`, `RandomizedLight`가 있다.

`ContactShadows`는 [Render Target](/posts/Render%20Target)에서 다룬 방식 그대로다. 위에서 내려다본 장면을 텍스처로 구워 바닥에 깔아준다. 진짜 그림자는 아니지만 물체가 바닥에 닿아 보이게 하는 데는 이것만으로 충분한 경우가 많고, 조명의 그림자 맵보다 훨씬 싸다.

`SoftShadows`는 실제 섀도우 맵의 가장자리를 부드럽게 만드는 것이라 비용이 붙는다. `samples`를 올릴수록 예뻐지고 느려진다.

`AccumulativeShadows`는 여러 각도에서 그림자를 누적해 한 장으로 굽는 방식이다. 정지된 쇼케이스에서 품질이 가장 좋지만, 물체가 움직이면 다시 구워야 한다.

## 배치

---

```jsx
import { Center, Bounds, Float } from '@react-three/drei';

{/* 바운딩 박스 기준으로 원점 정렬 — 모델 원점이 제멋대로일 때 필수 */}
<Center><Model /></Center>

{/* 자식 전체가 화면에 꽉 차도록 카메라 자동 조정 */}
<Bounds fit clip observe margin={1.2}>
  <Model />
</Bounds>

{/* 둥둥 떠다니는 연출 */}
<Float speed={2} rotationIntensity={1} floatIntensity={1}>
  <mesh>...</mesh>
</Float>
```

`Center`와 `Bounds`는 외부 모델을 다룰 때 거의 필수다. [OBJ](/posts/OBJ)에서 정리했던 "크기와 원점을 알 수 없다"는 문제를 컴포넌트로 해결해준다. 직접 `Box3`를 재서 스케일과 위치를 맞추던 코드가 태그 하나로 줄어든다.

`Bounds`의 옵션은 각각 이렇다.

- `fit`: 자식이 화면에 꽉 차도록 카메라를 옮긴다
- `clip`: 자식 크기에 맞춰 카메라의 `near`/`far`를 조정한다
- `observe`: 자식이 바뀌거나 리사이즈될 때 다시 맞춘다

## Stage

---

`Environment`, `ContactShadows`, 카메라 자동 조정, `Center`를 묶어 놓은 것이다.

```jsx
<Stage environment="city" intensity={0.5} shadows="contact">
  <Model />
</Stage>
```

프로토타이핑이나 쇼케이스에서 많이 쓴다. 모델 하나를 일단 그럴듯하게 보여주는 것이 목적이라면 이걸로 시작해서, 부족한 부분만 개별 컴포넌트로 풀어내는 순서가 편하다.

## Html

---

실제 DOM 요소를 3D 좌표에 얹을 때 쓴다.

```jsx
import { Html } from '@react-three/drei';

<mesh position={[0, 1, 0]}>
  <Html distanceFactor={10} center occlude>
    <div className="label">A-01</div>
  </Html>
</mesh>
```

| prop | 의미 |
| --- | --- |
| `center` | 앵커를 중앙으로 |
| `distanceFactor` | 거리에 따른 크기 스케일 |
| `occlude` | 객체 뒤에 가려짐. `blend`와 `raycast` 모드 |
| `transform` | DOM을 3D 공간에 실제로 변형해 배치 |
| `portal` | 특정 DOM 컨테이너로 포탈 |
| `zIndexRange` | z-index 범위 |
| `sprite` | 항상 카메라를 향함 |

참고할 점이 두 가지 있다.

1. **DOM이 캔버스 위에 얹히므로 그 영역은 3D 클릭이 안 된다.** 라벨이 물체 위를 덮으면 물체를 클릭할 수 없게 된다. 클릭이 필요 없는 라벨이라면 `pointerEvents: 'none'`을 준다.
2. **개수가 수백 개 이상이면 렌더링이 느려진다.** 매 프레임 DOM 요소의 transform을 갱신하기 때문이다. 개수가 많으면 `Text`나 스프라이트 아틀라스로 바꾸는 것이 맞다.

`distanceFactor`를 주면 3D 물체처럼 멀어질수록 작아지고, 주지 않으면 항상 같은 픽셀 크기로 보인다. UI 성격이면 주지 않는 쪽이 읽기 편하다.

## 텍스트

---

```jsx
import { Text, Text3D } from '@react-three/drei';

<Text fontSize={0.5} color="white" anchorX="center" anchorY="middle">
  Hello
</Text>
```

`Text`는 SDF 방식이라 확대해도 깨지지 않고, DOM이 아니라 실제 3D 객체라 물체 뒤로 가려진다.

**한글은 폰트를 지정해야 한다.** 기본 폰트에 한글 글리프가 없어서 네모로 나온다. 문제는 한글 폰트 파일이 수 MB 단위라는 것이다. 몇 글자를 위해 폰트 전체를 받는 것은 과하므로, 글자 수가 적으면 차라리 `Html`을 쓰는 편이 낫다. 꼭 3D 텍스트여야 한다면 서브셋 폰트를 만들어 쓴다.

## 디버깅 도구

---

```jsx
import { Grid, GizmoHelper, GizmoViewport, Stats, useHelper } from '@react-three/drei';

<Grid infiniteGrid cellSize={1} sectionSize={5} fadeDistance={30} />

<GizmoHelper alignment="bottom-right" margin={[80, 80]}>
  <GizmoViewport />
</GizmoHelper>

<Stats />   {/* FPS 카운터 */}
```

`useHelper`는 조명과 카메라 절두체를 시각화한다.

```tsx
import { DirectionalLightHelper, CameraHelper } from 'three';

function Sun() {
  const lightRef = useRef<THREE.DirectionalLight>(null!);

  useHelper(lightRef, DirectionalLightHelper, 1, 'red');
  useHelper(lightRef.current?.shadow.camera, CameraHelper);  // 그림자 절두체

  return <directionalLight ref={lightRef} position={[5, 8, 5]} castShadow />;
}
```

두 번째 줄이 특히 유용하다. [shadow](/posts/shadow)에서 정리한 그림자 절두체 문제를 눈으로 확인할 수 있다. 그림자가 어느 선에서 잘리는지 보이면 `shadow.camera`의 범위를 얼마나 넓혀야 하는지 바로 판단할 수 있다.

이 헬퍼들은 개발용이므로 프로덕션 번들에서는 빼야 한다.

## 성능

---

```jsx
import { PerformanceMonitor, AdaptiveDpr, AdaptiveEvents, Detailed, Bvh } from '@react-three/drei';

{/* 프레임률을 감시하며 DPR 자동 조절 */}
<PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(2)} />

{/* 카메라 이동 중 DPR과 이벤트 정밀도를 낮추기 */}
<AdaptiveDpr pixelated />
<AdaptiveEvents />

{/* 거리별 LOD */}
<Detailed distances={[0, 10, 25]}>
  <HighPoly /><MidPoly /><LowPoly />
</Detailed>

{/* 레이캐스트 가속 */}
<Bvh><ComplexModel /></Bvh>
```

`AdaptiveDpr`은 카메라를 움직이는 동안만 해상도를 낮췄다가 멈추면 되돌린다. 움직이는 중에는 어차피 디테일이 잘 안 보이기 때문에 체감 품질 손해가 거의 없으면서 프레임은 확실히 올라간다.

`Detailed`는 three.js의 `LOD`를 감싼 것이고, `Bvh`는 [Events and Interaction](/posts/Events%20and%20Interaction)에서 언급한 레이캐스트 가속이다.

## 마지막으로

---

drei 컴포넌트를 쓸 때는 **소스를 열어보는 습관**을 들이는 것이 좋다. 대부분 파일 하나에 100줄 남짓이고, 결국은 앞선 글들에서 다룬 three.js API를 조합한 것이다. 내부를 한 번 보면 어떤 prop이 무엇을 하는지, 왜 어떤 조합에서는 동작하지 않는지가 바로 잡힌다. 문서만으로는 알 수 없는 제약이 코드에는 그대로 드러나 있다.
