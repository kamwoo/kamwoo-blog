---
title: Performance Optimization
published: true
category: react-three-fiber
subtitle: 성능 측정 및 분석, 대응 방식
date: 2026-08-12
---

## 측정

---

3D에서 느리다는 말은 원인을 하나도 알려주지 않는다. 드로우 콜이 많은 것과 프래그먼트 셰이더가 무거운 것은 증상이 같아도 해법이 정반대다. 숫자를 먼저 봐야 한다.

**r3f-perf**

FPS, GPU 시간, CPU 시간, 드로우 콜, 삼각형 수, 텍스처 수, 지오메트리 수, 셰이더 컴파일 수를 한 화면에 띄워준다. drei의 `Stats`가 FPS만 보여주는 것과 달리 병목을 가르는 데 필요한 값이 다 있다.

```jsx
import { Perf } from 'r3f-perf';

<Canvas>
  <Perf position='top-left' />
</Canvas>;
```

**renderer.info**

직접 읽고 싶을 때는 렌더러가 들고 있는 통계를 본다.

```javascript
useFrame(({ gl }) => {
  gl.info.render.calls; // 드로우 콜
  gl.info.render.triangles; // 삼각형 수
  gl.info.memory.geometries; // 현재 지오메트리
  gl.info.memory.textures; // 현재 텍스처
  gl.info.programs?.length; // 컴파일된 셰이더 프로그램
});
```

`render` 쪽은 매 프레임 초기화되는 값이고, `memory` 쪽은 누적된 현재 상태다. **`geometries`와 `textures`가 시간이 지나며 계속 증가하면 메모리 누수다.** 씬을 전환했는데 이전 씬의 리소스가 정리되지 않았거나, 매 프레임 새 지오메트리를 만들고 있다는 뜻이다. R3F는 자기가 만든 것은 언마운트에서 정리하지만 밖에서 `new`로 만들어 넣은 것까지 책임지지 않는다. [Disposing Memory](/posts/Disposing%20Memory) 쪽 이야기가 그대로 적용된다.

`programs`가 계속 늘어나는 것도 신호다. 재질 하나에 정의를 바꾸는 속성을 매번 다르게 주면 그때마다 셰이더가 새로 컴파일된다. 첫 등장에서 화면이 잠깐 멎는 현상의 원인이기도 하다.

## 병목 확인

---

증상으로 단계를 좁힐 수 있다.

**1. JS / CPU 연산**

창을 줄여도 FPS가 그대로다. r3f-perf에서 CPU 시간이 GPU 시간보다 크다.

렌더링이 아니라 자바스크립트가 느린 것이다. `useFrame` 안의 계산, 과도한 리렌더, 레이캐스트가 후보다.

**2. 드로우 콜**

삼각형 수는 적은데 `calls`가 1000을 넘는다.

객체 하나를 그릴 때마다 CPU가 GPU에 명령을 보내는 준비 비용이 든다. 삼각형 100개짜리 객체 1000개는 삼각형 10만 개짜리 객체 하나보다 훨씬 느리다.

**3. 정점 처리**

모델을 단순화하면 빨라진다. 창 크기와는 무관하다.

정점 수 자체가 많은 경우다. 폴리곤을 줄이거나 LOD로 간다.

**4. 프래그먼트 처리**

**창을 줄이거나 DPR을 낮추면 바로 빨라진다.** 픽셀 수에 비례하는 비용이라는 뜻이다.

가장 흔하고 가장 확인하기 쉬운 병목이다. 창 크기를 반으로 줄여서 FPS가 눈에 띄게 오르면 여기다. 원인은 보통 셋 중 하나다. DPR이 너무 높거나, 후처리가 많거나, 반투명 물체가 겹쳐 같은 픽셀을 여러 번 그리고 있거나.

DPR을 확인하는 것이 첫 수순이다. 레티나 디스플레이에서 `dpr`을 제한하지 않으면 픽셀 수가 4배가 된다.

```jsx
<Canvas dpr={[1, 2]}>   // 1~2 사이로 제한
```

**5. VRAM**

텍스처가 많거나 크면 GPU 메모리가 찬다. 4096×4096 텍스처 하나가 압축 없이 64MB다. 한계를 넘으면 프레임이 불규칙하게 튀고, 심하면 컨텍스트가 날아간다.

## 드로우 콜 줄이기

---

같은 지오메트리와 재질을 쓰는 객체가 여러 개라면 한 번의 드로우 콜로 묶을 수 있다.

```javascript
import { Instances, Instance } from '@react-three/drei';

<Instances limit={2000}>
  <boxGeometry args={[0.2, 0.2, 0.2]} />
  <meshStandardMaterial />
  {data.map((d) => (
    <Instance key={d.id} position={d.pos} color={d.color} />
  ))}
</Instances>;
```

drei의 `Instances`는 `InstancedMesh`를 감싸서 각 인스턴스를 컴포넌트처럼 다루게 해준다. 위치와 색을 props로 주면 내부적으로 인스턴스 행렬과 색상 속성에 써넣는다. 이벤트도 인스턴스 단위로 받을 수 있다.

**조건은 지오메트리와 재질이 같아야 한다는 것이다.** 형태가 다르면 형태별로 `Instances`를 나눈다. 종류가 대여섯 개라면 드로우 콜도 대여섯 번이니 여전히 큰 이득이다.

`limit`은 미리 잡아둘 최대 개수다. 이 값만큼 버퍼를 할당하므로 실제보다 지나치게 크게 잡으면 메모리가 낭비되고, 작게 잡으면 초과분이 그려지지 않는다.

`InstancedMesh`를 직접 쓰는 경우와 인스턴싱의 원리는 [Optimizing Many Objects](/posts/Optimizing%20Many%20Objects)에 정리해뒀다.

인스턴싱이 안 맞는 경우에는 다른 방법을 본다.

- 형태가 다 다르지만 정적이라면 `BufferGeometryUtils.mergeGeometries`로 하나로 합친다. 대신 개별 제어를 잃는다.
- 재질만 다르다면 텍스처 아틀라스로 묶어 재질 하나로 만든다.
- 아주 멀리 있는 것들은 빌보드 하나로 대체한다.

## 온디맨드 렌더링

---

애니메이션이 없거나 정적인 씬에서 GPU를 계속 돌릴 필요는 없다.

```jsx
<Canvas frameloop='demand'>
```

이 모드에서 R3F는 필요할 때만 그린다. props가 바뀌거나, 컨트롤이 움직이거나, `invalidate()`가 불릴 때다. 외부에서 데이터가 들어와 씬을 고쳤다면 직접 알려줘야 한다.

```javascript
const invalidate = useThree((s) => s.invalidate);

socket.onmessage = (e) => {
  applyToScene(e.data);
  invalidate();
};
```

정적인 뷰어라면 이 한 줄로 유휴 상태의 GPU 사용량이 사실상 0이 된다. 노트북 배터리와 팬 소음에서 차이가 크다.

**함정은 `useFrame`으로 도는 애니메이션과 섞이지 않는다는 점이다.** `demand`에서 `useFrame` 콜백은 프레임이 그려질 때만 실행되므로, 계속 움직여야 하는 것이 하나라도 있으면 그 부분은 `invalidate`를 매번 불러야 하고 결국 `always`와 같아진다. 정적인 부분과 움직이는 부분이 섞여 있다면 모드를 나누는 대신 다음의 적응형 쪽을 본다. 자세한 것은 [On-Demand Rendering](/posts/On-Demand%20Rendering)에 있다.

## 적응형 품질

---

프레임률을 지키기 위해 품질을 떨어뜨리는 방식이다. 60fps로 도는 저화질이 30fps로 도는 고화질보다 대체로 낫다.

```javascript
function Adaptive() {
  const [dpr, setDpr] = useState(1.5);
  return (
    <>
      <PerformanceMonitor
        onIncline={() => setDpr(2)}
        onDecline={() => setDpr(1)}
        flipflops={3}
        onFallback={() => setDpr(1)}
      />
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </>
  );
}
```

- `PerformanceMonitor`는 프레임률 추세를 관찰한다. 여유가 생기면 `onIncline`, 떨어지면 `onDecline`이 불린다.
- `flipflops`는 위아래를 몇 번 오가면 포기할지를 정한다. 3번 진동하면 `onFallback`으로 가서 낮은 값에 고정한다. **이게 없으면 올렸다 내렸다를 반복하며 화면 해상도가 계속 깜빡인다.**
- `AdaptiveDpr`은 카메라가 움직이는 동안 DPR을 낮췄다가 멈추면 되돌린다. 움직이는 중에는 어차피 세부가 잘 안 보인다는 점을 이용한다. `pixelated`는 이때 보간 없이 확대해서 흐릿함 대신 각진 픽셀을 택하는 옵션이다.
- `AdaptiveEvents`는 같은 원리로 움직이는 동안 레이캐스트를 멈춘다.

DPR 말고도 떨어뜨릴 수 있는 것은 많다. 그림자 맵 크기, 후처리 단계 수, 환경맵 해상도, 안개로 가리는 거리 순으로 내려가면 체감 화질 손해가 적다.

## 컬링과 LOD

---

카메라 시야 밖의 객체를 건너뛰는 절두체 컬링은 three.js가 기본으로 해준다. 다만 **바운딩 구를 기준으로 판정하므로**, 정점을 셰이더에서 크게 움직이거나 지오메트리를 직접 수정한 경우에는 화면 안에 있는데도 사라질 수 있다. 그럴 때는 `geometry.computeBoundingSphere()`를 다시 부르거나 `frustumCulled={false}`로 끈다.

거리별로 디테일을 바꾸는 LOD는 이렇게 쓴다.

```javascript
import { Detailed } from '@react-three/drei';

<Detailed distances={[0, 12, 30]}>
  <HighPoly />
  <MidPoly />
  <Billboard />
</Detailed>;
```

거리 0~12에서는 첫 번째, 12~30에서는 두 번째, 30 이상은 세 번째를 그린다. 자식의 순서와 `distances` 배열의 순서가 대응하므로 개수를 맞춰야 한다.

전환 지점에서 형태가 눈에 띄게 바뀌면 튀는 것이 보인다. 단계 간 실루엣을 비슷하게 유지하거나, 전환 거리를 충분히 멀리 잡아 눈에 덜 띄게 한다.

주의할 점은 **모든 단계의 지오메트리가 메모리에 올라가 있다는 것이다.** LOD는 그리는 비용을 줄이지 정점 데이터의 메모리를 줄이지 않는다. VRAM이 병목이면 LOD는 답이 아니다.

## 레이캐스트 최적화

---

레이캐스트는 광선과 삼각형의 교차를 전부 계산하는 방식이라 비싸다. 포인터가 움직이는 동안 매 프레임 돈다는 점까지 생각하면 더 그렇다.

- **BVH**: drei의 `Bvh`로 감싸면 공간 분할 트리를 타므로 삼각형을 전부 도는 것보다 훨씬 빠르다. 정밀한 판정이 필요할 때. [BVH](/posts/BVH)에 원리를 정리해뒀다.
- **히트박스**: 실제 모델은 `raycast={null}`로 빼고, 단순한 박스를 `visible={false}`로 겹쳐 그것만 검사하게 한다. [Events and Interaction](/posts/Events%20and%20Interaction)에 자세히 적었다.
- **GPU 피킹**: 객체마다 고유 색을 칠한 화면을 [렌더 타겟](/posts/Render%20Target)에 그려두고 해당 픽셀의 색을 읽는 방식이다. 삼각형 수와 무관하게 일정한 비용이 든다. [picking](/posts/picking)에 원리를 정리해뒀다.

핸들러를 붙인 객체만 검사 대상이 된다는 규칙을 이용해, 상호작용이 필요 없는 것에는 핸들러를 붙이지 않는 것이 가장 기본이다.

## 할당 줄이기

---

```javascript
// ✗ 초당 60개의 쓰레기
useFrame(() => {
  const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
});

// ✓ 미리 만들어두고 값만 갱신
const tmp = new THREE.Vector3();
useFrame(() => {
  tmp.set(0, 0, -1).applyQuaternion(q);
});
```

객체 하나의 생성 비용은 무시할 만하지만 문제는 GC다. 초당 60개씩, 객체가 100개면 초당 6000개가 쌓이다가 어느 순간 GC가 돌면서 프레임이 한 번 크게 튄다. 평균 FPS는 멀쩡한데 주기적으로 끊기는 느낌이 든다면 대개 이것이다.

`Vector3`, `Quaternion`, `Matrix4`, `Color`, `Euler` 전부 해당한다. three.js의 API가 `set`, `copy`, `add` 같은 제자리 갱신 메서드를 갖춘 것도 이 패턴을 전제하기 때문이다.

컴포넌트 안에서 만들 때는 `useMemo`로 감싸야 리렌더 때마다 새로 만들지 않는다.

```javascript
const tmp = useMemo(() => new THREE.Vector3(), []);
```

모듈 스코프에 두는 방법도 있는데, 이때는 모든 인스턴스가 같은 객체를 공유한다는 점을 알고 써야 한다. `useFrame` 안에서 만들고 바로 쓰고 버리는 임시값이라면 문제없지만, 프레임을 넘어 값을 유지해야 한다면 각자 갖게 해야 한다. 같은 발상을 일반화한 것이 [object pool](/posts/object%20pool)이다.

배열도 마찬가지다. `useFrame` 안에서 `map`이나 `filter`를 부르면 매 프레임 새 배열이 생긴다. 미리 만든 배열에 인덱스로 채우는 편이 낫다.

## 정리

---

1. **측정한다.** r3f-perf를 띄우고 CPU와 GPU 중 어느 쪽이 큰지 본다.
2. **단계를 좁힌다.** 창을 줄여보는 것만으로 프래그먼트 병목인지 아닌지 갈린다.
3. **그 단계의 해법을 쓴다.** 드로우 콜이면 인스턴싱, 프래그먼트면 DPR과 후처리, CPU면 리렌더와 할당.
4. **애초에 안 그려도 되는지 본다.** 정적인 씬이라면 `frameloop='demand'` 한 줄이 위의 어떤 최적화보다 크다.

가장 흔한 실수는 2번을 건너뛰고 눈에 익은 최적화부터 적용하는 것이다. 프래그먼트가 병목인 씬에서 인스턴싱을 아무리 해도 FPS는 그대로다.
