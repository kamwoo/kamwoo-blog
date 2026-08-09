---
title: Hooks and Render Loop
published: true
category: react-three-fiber
subtitle: The two clocks in an R3F app, and what useThree, useFrame and useLoader each do in them
date: 2026-08-09
---

## 두 개의 시계

---

R3F를 쓰면서 제일 먼저 잡아야 하는 감각은 시계가 두 개라는 것이다.

```javascript
[React 시계]  상태 변경 → 재조정 → 씬 그래프 구조/속성 커밋
                                          ↓
                                    (React 손 뗌)
                                          ↓
[프레임 시계]  requestAnimationFrame 루프 → useFrame 콜백들 → gl.render(scene, camera)
               ↑____________________________________________________|
                              초당 60~120회, React와 무관
```

무엇을 어느 시계에 둘지 예를 들면 이렇다.

- 큐브의 개수, 색상 팔레트, 선택된 오브젝트 id → **React 시계**
- 회전, 위치 보간, 카메라 추적 → **프레임 시계**

기준은 간단하다. **UI가 반응해야 하는 값이면 React 상태, 화면에만 반영되면 되는 값이면 프레임 시계**다. 회전 각도를 `useState`에 넣으면 초당 60번 재조정이 돌고, 그 각도를 보여주는 DOM이 없다면 그 60번은 전부 낭비다.

## useThree

---

R3F 루트 상태에 접근하는 훅이다. 내부는 zustand로 되어 있어서 셀렉터로 필요한 것만 구독할 수 있다.

```javascript
const camera = useThree((state) => state.camera);
const { width, height } = useThree((state) => state.size);
```

셀렉터 없이 `useThree()`를 그냥 부르면 상태 전체를 구독하게 되어 불필요한 리렌더가 생긴다. 특히 `size`는 리사이즈마다 바뀌므로, 필요한 필드만 뽑는 습관을 들이는 것이 좋다.

훅이므로 **`Canvas` 하위 컴포넌트에서만 동작한다.** `Canvas`와 같은 레벨이나 바깥에서 부르면 컨텍스트가 없어서 에러가 난다. 이걸 놓치고 `Canvas` 형제 컴포넌트에서 카메라를 만지려다 막히는 경우가 흔하다.

| 필드 | 설명 |
| --- | --- |
| `gl` | WebGLRenderer |
| `scene` | 루트 scene |
| `camera` | 현재 기본 카메라 |
| `raycaster` | 이벤트용 레이캐스터 |
| `size` | 캔버스 크기 (픽셀) |
| `viewport` | three 월드 단위 크기 |
| `clock` | THREE.Clock |
| `controls` | `makeDefault`가 붙은 컨트롤 |
| `invalidate` | 프레임 한 장을 새로 그림 |
| `advance` | 수동 프레임 진행 |
| `setDpr`, `setSize` | 런타임 조정 |
| `set`, `get` | 상태 직접 조작 |

`size`와 `viewport`의 차이가 헷갈리기 쉽다. `size`는 캔버스의 픽셀 크기이고, `viewport`는 카메라 기준으로 화면을 채우는 월드 단위 크기다. 화면 가장자리에 물체를 딱 붙이고 싶을 때는 `viewport`를 쓴다.

```javascript
const { viewport } = useThree();
// 화면 왼쪽 끝
<mesh position={[-viewport.width / 2, 0, 0]} />
```

`get`은 구독하지 않고 현재 값을 읽는 함수다. 이벤트 핸들러 안에서 최신 상태가 필요할 때 쓴다.

```javascript
const get = useThree((state) => state.get);

const onClick = () => {
  const { camera } = get(); // 구독 없이 최신 값
};
```

## useFrame

---

프레임마다 실행되는 콜백을 등록한다.

```javascript
useFrame((state, delta, xrFrame) => { ... }, priority?)
```

- `state`: 루트 상태. `useThree`로 받는 것과 같은 객체다.
- `delta`: 이전 프레임과의 시간 간격(초)
- `priority`: 실행 순서 및 렌더 제어

`priority`는 두 가지 일을 한다.

- **실행 순서**: 콜백들이 `priority` 오름차순으로 실행된다.
- **렌더 제어**: 0보다 큰 콜백이 하나라도 있으면 R3F는 자동 렌더링을 중단하고 제어권을 넘긴다.

두 번째가 중요하다. 후처리를 붙일 때 `useFrame(() => composer.render(), 1)`처럼 쓰는데, 이때 R3F가 알아서 그리는 것을 멈추기 때문에 화면이 두 번 그려지지 않는다. 반대로 실수로 `priority`를 1로 주고 렌더를 부르지 않으면 **화면이 완전히 멈춘다.**

`priority`를 주지 않으면 기본 실행 순서는 마운트 순서에 의존한다. 순서가 중요한 로직이라면 명시하는 편이 안전하다.

`delta`를 곱하는 것도 습관을 들여야 한다. 프레임 수에 비례해 움직이면 120Hz 모니터에서 두 배 빨라진다.

```tsx
useFrame((_state, delta) => {
  if (!meshRef.current) return;

  meshRef.current.position.y += delta * 0.1;
});
```

`state.clock.getElapsedTime()`으로 누적 시간을 받을 수도 있다. 시간 기반과 상태 누적 중 무엇을 쓸지는 [Animation](/posts/Animation)에 정리했다.

`ref`가 아직 없을 수 있으므로 앞에서 한 번 걸러준다. 첫 프레임이 `ref` 대입보다 먼저 실행되는 경우가 있다.

## useLoader

---

Suspense 기반 로더다.

```javascript
const [color, normal, rough] = useLoader(THREE.TextureLoader, [
  '/color.jpg', '/normal.jpg', '/rough.jpg',
]);
```

배열을 주면 배열로 돌려준다. **사용하는 컴포넌트를 `Suspense` 경계로 감싸야 한다.** 감싸지 않으면 "A component suspended while responding to synchronous input" 류의 에러가 난다.

```jsx
<Canvas>
  <Suspense fallback={null}>
    <Model />
  </Suspense>
</Canvas>
```

세 번째 인자로 로더 인스턴스를 설정할 수 있다. Draco나 KTX2 디코더를 붙일 때 쓴다.

```javascript
const gltf = useLoader(GLTFLoader, '/ship.glb', (loader) => {
  loader.setDRACOLoader(dracoLoader);
});
```

같은 URL은 캐시되므로 여러 컴포넌트에서 같은 파일을 불러도 한 번만 받는다. 다만 **같은 인스턴스를 돌려주는 것**이라, 한 곳에서 재질을 수정하면 모든 사용처가 바뀐다. 이 문제는 [Loading Models and Textures](/posts/Loading%20Models%20and%20Textures)에서 다룬다.

## frameloop

---

렌더 루프를 도는 방식을 정한다.

```jsx
<Canvas frameloop="always" | "demand" | "never">
```

- `always`: 기본값. rAF 루프를 계속 돈다.
- `demand`: 필요할 때만 렌더한다. 상태가 바뀌거나 `invalidate()`를 부를 때 한 장 그린다.
- `never`: 수동으로 `advance()`를 부를 때만 그린다.

바닐라 three.js에서 [On-Demand Rendering](/posts/On-Demand%20Rendering)으로 직접 구현했던 것을 prop 하나로 켜는 셈이다. 움직이는 것이 없는 뷰어라면 `demand`만으로 유휴 상태의 GPU 사용량이 거의 0이 된다.

`demand`를 쓸 때 주의할 점은 **`useFrame` 안에서 값을 바꿔도 자동으로 다시 그려지지 않는다**는 것이다. 애니메이션이 있다면 `invalidate()`를 직접 불러야 한다.

```javascript
const invalidate = useThree((state) => state.invalidate);

// 로딩이 끝났거나 값이 바뀐 시점에
invalidate();
```

drei의 `OrbitControls`처럼 잘 만들어진 컴포넌트는 내부에서 `invalidate`를 불러주므로 카메라 조작은 그대로 동작한다.
