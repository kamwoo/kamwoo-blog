---
title: First Scene
published: true
category: react-three-fiber
subtitle: Canvas 기본값과 y-up 좌표계, 디버깅 가능한 씬 만들기
date: 2026-08-09
---

## Canvas 기본값

---

`Canvas`는 아무 prop도 주지 않아도 렌더러와 카메라를 만들어준다. 무엇이 기본으로 잡히는지 알아야 어디를 덮어쓸지 판단할 수 있다.

**renderer**

- `antialias = true`
- alpha 채널이 켜져 있고 clear alpha가 0이다. 즉 **기본 배경은 투명하다.**
- `toneMapping = ACESFilmicToneMapping`
- `outputColorSpace = SRGBColorSpace`
- `dpr = [1, 2]` — 기기 픽셀 비율을 1과 2 사이로 자른다

**camera**

- `PerspectiveCamera`
- `fov = 75`
- `near = 0.1`
- `far = 1000`
- `position = [0, 0, 5]`

여기에 기본 `Scene`과 `Raycaster`가 함께 만들어진다.

배경이 투명하다는 점이 처음에 헷갈렸다. 캔버스 뒤에 있는 DOM의 배경색이 그대로 비쳐 보이기 때문에, 부모 div에 색을 주면 그게 배경이 된다. three.js처럼 씬 자체에 배경을 넣고 싶으면 `color` 태그를 `background`에 붙인다.

```jsx
<color attach="background" args={['#0e1013']} />
```

`fov` 75는 꽤 넓은 편이다. 사람 눈에 자연스럽게 보이는 값은 40에서 55 사이라, 제품 쇼케이스처럼 왜곡이 거슬리는 장면은 50 정도로 낮추는 편이 낫다. 연습 프로젝트에서도 50으로 잡았다.

```tsx
<Canvas shadows camera={{ position: [5, 4, 6], fov: 50 }}>
```

`camera` prop은 **기본 카메라의 생성 옵션**이지 카메라 인스턴스를 교체하는 것이 아니다. 직교 카메라를 쓰려면 `orthographic` 불리언 prop을 켜거나, drei의 `PerspectiveCamera`에 `makeDefault`를 붙여 별도 카메라를 등록한다.

`shadows`는 `renderer.shadowMap.enabled = true`에 해당한다. 문자열로 타입을 지정할 수도 있다.

```jsx
<Canvas shadows="soft">     {/* PCFSoftShadowMap */}
<Canvas shadows="variance"> {/* VSMShadowMap */}
```

## 좌표계와 단위

---

- 오른손 좌표계, **y가 위**
- `1 unit = 1 meter`가 사실상 표준

y-up은 three.js의 규칙이고, 블렌더 같은 도구는 z가 위인 경우가 많다. 모델을 불러왔는데 누워 있다면 대개 이 차이다. 이 문제는 [OBJ](/posts/OBJ)에 정리해뒀다.

단위는 강제되는 규칙이 아니라 관례다. 그런데 지키는 편이 훨씬 낫다. 물리 기반 조명과 카메라의 기본값들이 미터 스케일을 가정하고 잡혀 있기 때문이다. 1 unit을 1cm로 쓰기 시작하면 조명 세기, `near`/`far`, 그림자 절두체 크기를 전부 손으로 다시 맞춰야 한다.

물체가 너무 작거나 크면 다음 증상이 나온다.

- 너무 작을 때: `near = 0.1` 안쪽에 들어가 잘려 보이거나, 그림자 해상도가 낭비된다
- 너무 클 때: `far = 1000` 밖으로 나가 사라지고, 깊이 버퍼 정밀도가 부족해 z-fighting이 생긴다

## 디버깅 가능한 씬 구성하기

---

첫 씬을 만들 때 큐브 하나만 띄우면 오히려 아무것도 알 수 없다. 원점이 어딘지, 축이 어느 방향인지, 프레임이 나오는지를 볼 수 있게 잡아두면 이후가 편하다.

```tsx
import { Canvas } from '@react-three/fiber';
import { GizmoHelper, GizmoViewport, Grid, OrbitControls, Stats } from '@react-three/drei';
import { SunLight } from './lights/sun';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0e1013' }}>
      <Canvas shadows camera={{ position: [5, 4, 6], fov: 50 }}>
        <SunLight />
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2.1} minDistance={3} maxDistance={30} />

        <Grid
          infiniteGrid
          position={[0, 0, 0]}
          cellSize={0.5}
          sectionSize={2.5}
          sectionColor={'#39424d'}
          cellColor={'#242a31'}
          fadeDistance={50}
        />

        <GizmoHelper alignment='bottom-right' margin={[70, 70]}>
          <GizmoViewport />
        </GizmoHelper>

        <Stats />
      </Canvas>
    </div>
  );
}

export default App;
```

각각이 하는 일은 이렇다.

- `Grid`: 바닥 격자. 물체가 원점에서 얼마나 떨어져 있는지, 크기가 어느 정도인지 눈으로 잡힌다.
- `GizmoViewport`: 우하단의 축 표시기. 지금 어느 방향에서 보고 있는지 알려주고, 클릭하면 그 축 정면으로 카메라가 이동한다.
- `Stats`: FPS 카운터.
- `OrbitControls`: 마우스로 궤도 회전.

`maxPolarAngle={Math.PI / 2.1}`은 카메라가 바닥 아래로 내려가지 못하게 막는 것이다. 격자 아래에서 보면 방향 감각이 무너지기 때문에 처음부터 막아두는 편이 낫다.

`makeDefault`는 컨트롤을 R3F 루트 상태에 등록하는 옵션이다. 이걸 붙여야 drei의 다른 컴포넌트들이 "현재 컨트롤"을 인식한다. 자세한 내용은 [drei](/posts/drei)에 적었다.

조명은 별도 컴포넌트로 뺐다.

```tsx
import { useHelper } from '@react-three/drei';
import { useRef } from 'react';
import { CameraHelper, DirectionalLightHelper, type DirectionalLight } from 'three';

export const SunLight = () => {
  const lightRef = useRef<DirectionalLight>(null);

  useHelper(lightRef, DirectionalLightHelper, 1, 'red');
  useHelper(lightRef.current?.shadow.camera, CameraHelper);

  return <directionalLight ref={lightRef} position={[5, 8, 5]} castShadow />;
};
```

조명을 컴포넌트로 분리한 이유는 헬퍼를 붙이려면 `ref`가 필요하고, `ref`를 쓰려면 훅을 쓸 수 있는 컴포넌트 안이어야 하기 때문이다. `Canvas` 안에서 바로 `useRef`를 쓸 수는 없다.

두 번째 `useHelper`는 그림자 절두체를 그려준다. **그림자가 잘리거나 아예 안 나올 때 이게 없으면 원인을 찾기 어렵다.** `DirectionalLight`의 그림자 카메라는 기본 범위가 좁아서, 넓은 장면에서는 절두체 밖의 물체가 그림자를 만들지 않는다. 눈으로 보면서 `shadow.camera`의 범위를 넓히면 된다.

조명이 하나도 없으면 `MeshStandardMaterial`은 완전히 검게 나온다. 처음에 화면이 검을 때는 조명이 없는 것인지, `Canvas`의 부모에 높이가 없는 것인지, 카메라가 물체 안쪽에 있는 것인지부터 확인한다.
