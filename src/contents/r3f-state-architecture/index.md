---
title: State and Component Architecture
published: true
category: react-three-fiber
subtitle: Splitting state by update frequency, why continuous values never belong in React state, and how to decompose a scene into components
date: 2026-08-11
---

## 상태를 세 층으로 나눈다

---

R3F에서 구조를 잘못 잡으면 대부분 상태를 어디에 둘지 잘못 골라서 생기는 문제다. 갱신 빈도를 기준으로 세 층으로 나눠 두면 판단이 쉬워진다.

| 층            | 갱신 빈도          | 저장 위치                  | 예시                                                   |
| ------------- | ------------------ | -------------------------- | ------------------------------------------------------ |
| **구조 상태** | 드묾 (사용자 행동) | React state / 스토어       | 선택된 객체 ID, 표시 레이어, 모드, 씬에 있는 객체 목록 |
| **연속 상태** | 초당 수십 회       | ref / 스토어(transient)    | 위치, 회전, 카메라, 실시간 텔레메트리                  |
| **파생 상태** | 계산됨             | `useMemo` / 프레임 내 계산 | 바운딩 박스, 거리 정렬, 화면 투영 좌표                 |

구조 상태와 연속 상태를 가르는 질문은 하나면 충분하다.

> 이 값이 바뀌면 JSX 상에서 트리 구조가 달라지는가?

- **그렇다 → 구조 상태.** 객체가 생기거나 사라지고, 레이어가 켜지고 꺼진다. React가 개입해야 하는 변화다.
- **아니다 → 연속 상태.** 트리는 그대로고 이미 존재하는 객체의 속성값만 달라진다. React를 거칠 이유가 없다.

연속 상태를 React state에 두면 어떻게 되는지는 계산해보면 명확하다. 60fps에서 위치를 state로 관리하면 초당 60번의 재조정이 돈다. 객체가 100개면 초당 6000번이다. 실제로 바뀌는 것은 `Object3D.position.x`라는 숫자 하나인데, 그 하나를 바꾸려고 React의 전체 파이프라인을 통과시키는 셈이다.

[Hooks and Render Loop](/posts/Hooks%20and%20Render%20Loop)에서 본 두 시계 이야기가 여기서 그대로 이어진다. 구조 상태는 React 시계, 연속 상태는 프레임 시계에 속한다. **층을 나눈다는 것은 각 값을 어느 시계에 맡길지 정하는 일이다.**

파생 상태는 원본이 어느 층에 있느냐에 따라 갈린다. 구조 상태에서 나오면 `useMemo`로 렌더 시점에 계산하고, 연속 상태에서 나오면 `useFrame` 안에서 그때그때 계산한다. 카메라와의 거리로 정렬하는 것은 매 프레임 달라지므로 후자다.

## 전역 상태는 zustand

---

R3F 자체가 zustand로 만들어져 있다. `useThree`가 읽는 것이 zustand 스토어이므로, 같은 것을 쓰면 사고방식이 하나로 통일된다.

**1. 셀렉터로 구독 범위를 좁힐 수 있다**

```javascript
// 스토어 전체를 구독 — 무엇이 바뀌든 리렌더
const store = useSceneStore();

// 셀렉터 — selectedId가 바뀔 때만 리렌더
const selectedId = useSceneStore((s) => s.selectedId);
```

수백 개의 객체가 같은 스토어를 보고 있어도, 각자 자기가 필요한 조각만 구독하면 관계없는 변경에 딸려 리렌더되지 않는다. Context로 같은 것을 하려면 Provider를 값별로 쪼개야 하는데 금방 관리가 안 된다.

**2. 리렌더 없는 구독이 가능하다**

이게 R3F에서 특히 중요하다. `subscribe`를 직접 쓰면 값 변경을 감지하되 컴포넌트는 다시 그리지 않을 수 있다.

```javascript
useEffect(() => {
  return useSceneStore.subscribe(
    (s) => s.targetPosition,
    (position) => {
      targetRef.current.copy(position);
    }, // 리렌더 없음
  );
}, []);
```

연속 상태를 전역에 두면서도 재조정을 발생시키지 않는 방법이다. zustand 문서에서 transient update라고 부르는 패턴이다.

`useFrame` 안에서 최신값을 읽고 싶을 때는 `getState()`를 쓴다. 훅으로 읽으면 그 값이 구독 대상이 되어버리지만, `getState()`는 구독 없이 현재 값만 가져온다.

```javascript
useFrame(() => {
  const { mode } = useSceneStore.getState(); // 구독하지 않고 읽기
  if (mode === 'follow') {
    /* ... */
  }
});
```

**3. Canvas 경계 문제**

Canvas 안쪽은 R3F의 리컨사일러가 그리는 별도 루트다. 예전에는 이 경계를 React Context가 넘지 못해서 바깥 Provider의 값을 안에서 읽을 수 없었고, drei의 `useContextBridge`로 직접 이어줘야 했다.

지금은 그럴 필요가 없다. **R3F v8부터 `Canvas`가 내부적으로 컨텍스트 브릿지를 자동으로 걸어준다.** 설치된 v9의 구현을 열어보면 `its-fine`의 `useContextBridge`로 부모 트리의 컨텍스트를 모아 다시 제공하는 `Bridge` 컴포넌트로 자식을 감싸고 있다. StrictMode도 같이 넘겨준다.

그래도 zustand를 쓰는 이유는 남는다. 스토어는 React 트리에 매여 있지 않아서 Canvas 안이든 밖이든 같은 방식으로 접근할 수 있고, 위의 1번과 2번이 Context에는 없기 때문이다.

## 컴포넌트 분해

---

### useFrame을 가진 컴포넌트는 분리한다

```javascript
// 나쁨: 상위에서 전부 제어
function Scene() {
  const groupRef = useRef();
  useFrame(() => {
    groupRef.current.children.forEach((c, i) => { c.rotation.y += 0.01; });
  });
  return <group ref={groupRef}>{items.map(...)}</group>;
}

// 좋음: 각자 자기 애니메이션을 소유
function Item({ index }) {
  const ref = useRef();
  useFrame(({ clock }) => { ref.current.rotation.y = clock.elapsedTime + index; });
  return <mesh ref={ref}>...</mesh>;
}
```

위쪽이 나쁜 이유는 성능이 아니라 결합이다. 부모가 `children` 배열의 순서에 의존하고 있어서, 자식 하나를 조건부로 감추거나 그룹을 하나 끼워 넣는 순간 인덱스가 어긋난다. 애니메이션의 소유권이 대상에게 있지 않으니 그 컴포넌트만 떼어 다른 곳에 쓸 수도 없다.

**단, 개수가 많으면 반대로 합친다.** `useFrame` 구독은 R3F가 배열로 관리하며 매 프레임 순회한다. 콜백 하나의 비용은 작지만 1000개면 1000번의 호출이고, 컴포넌트마다 클로저와 ref가 붙는 메모리도 무시할 수 없다. 이 규모에서는 부모가 `useFrame` 하나로 전부 도는 편이 낫고, 그때는 `children` 대신 인스턴스 배열을 명시적으로 들고 도는 것이 안전하다. [Optimizing Many Objects](/posts/Optimizing%20Many%20Objects)의 `InstancedMesh`와 같이 가면 자연스럽게 이 형태가 된다.

경계는 대략 수십 개다. 그보다 적으면 나누고, 수백 개를 넘어가면 합치는 쪽을 고민한다.

### 변환은 group으로 계층화한다

```javascript
<group position={worldOrigin} rotation-y={northOffset}>   {/* 좌표계 정렬 */}
  <group visible={showVessels}>                            {/* 레이어 토글 */}
    {vessels.map(...)}
  </group>
  <group visible={showRoutes}>{routes.map(...)}</group>
</group>
```

각 `group`에 역할을 하나씩만 준 것이 핵심이다. 바깥은 좌표계 보정, 안쪽은 레이어 가시성이다. 한 노드가 두 가지를 겸하면 나중에 하나를 끄려다 다른 하나까지 영향을 받는다.

`visible={false}`는 그 아래 전체를 렌더에서 제외한다. 조건부 렌더링으로 트리에서 빼는 것과 결과는 비슷해 보이지만 성격이 다르다.

- `visible` 토글: 객체는 메모리에 남아 있고 그리기만 건너뛴다. 다시 켤 때 즉시 나타난다.
- 조건부 렌더링: 언마운트되어 지오메트리와 텍스처가 정리되고, 다시 켜면 재생성 비용이 든다.

자주 껐다 켜는 레이어는 `visible`, 오래 안 쓸 것은 언마운트가 맞다. 다만 `visible={false}`인 mesh도 [레이캐스트에는 잡힌다](/posts/Events%20and%20Interaction)는 점은 기억해야 한다.

### 렌더하지 않는 컴포넌트

`null`을 반환하면서 훅만 실행하는 컴포넌트가 R3F에서는 흔하고 유용하다.

```tsx
function CameraController() {
  const controls = useThree((s) => s.controls);
  const focusTarget = useSceneStore((s) => s.focusTarget);

  useEffect(() => {
    /* ... */
  }, [focusTarget]);

  return null;
}
```

씬 그래프에 아무것도 추가하지 않지만 R3F의 생명주기와 프레임 루프에는 참여한다. 로직에 마운트/언마운트 경계가 생기고, 조건부로 껐다 켤 수 있으며, 테스트할 때 따로 떼어낼 수 있다. 이런 것들을 `systems/` 같은 폴더에 모아두면 "그리는 것"과 "동작시키는 것"이 폴더 단위로 갈린다.

## 명령형 제어

---

"버튼을 누르면 카메라가 그 객체로 이동" 같은 동작은 상태로 표현하기가 어색하다. 상태는 어떤 시점의 값이지만 이건 한 번 일어나는 사건이기 때문이다. `focusTarget`을 상태로 두면 **같은 대상을 다시 눌렀을 때 값이 안 바뀌어서 아무 일도 일어나지 않는** 문제에 바로 부딪힌다.

**방법 1. 명령 카운터**

```javascript
const useCameraStore = create((set) => ({
  focusTarget: null as string | null,
  focusSeq: 0,
  focusOn: (id: string) => set((s) => ({ focusTarget: id, focusSeq: s.focusSeq + 1 })),
}));

// 씬 안
const { focusTarget, focusSeq } = useCameraStore();
useEffect(() => {
  if (focusTarget) controls.fitToBox(objects[focusTarget], true);
}, [focusSeq]);   // seq를 의존성으로 → 같은 대상 재요청도 동작
```

`focusSeq`가 매번 증가하므로 대상이 같아도 이펙트가 다시 돈다. 사건을 상태로 흉내내는 방법이고, 상태 하나만 늘리면 되니 도입이 쉽다.

의존성 배열에 `focusSeq`만 넣고 `focusTarget`은 뺐다는 점을 봐야 한다. 의도한 것이지만 린트 규칙과는 충돌하므로 주석을 남겨두는 편이 낫다.

**방법 2. 명령형 핸들러를 스토어에 등록**

```javascript
const useSceneApi = create < { api: SceneApi | null } > (() => ({ api: null }));

// 씬 안에서 등록
useEffect(() => {
  useSceneApi.setState({ api: { focusOn, resetCamera, screenshot } });
  return () => useSceneApi.setState({ api: null });
}, []);

// 밖에서 호출
const api = useSceneApi((s) => s.api);
<button onClick={() => api?.resetCamera()}>초기화</button>;
```

명령이 여러 개일 때는 이쪽이 낫다. 명령마다 카운터를 하나씩 만드는 대신 함수 하나씩 늘리면 되고, 호출부의 코드가 하려는 일 그대로 읽힌다.

대신 `api`가 `null`일 수 있다는 것을 항상 다뤄야 한다. 씬이 아직 마운트되지 않았거나 Suspense로 대기 중이면 비어 있다. 언마운트에서 `null`로 되돌리는 정리 코드를 빼먹으면 사라진 씬의 함수를 붙들고 있게 된다.

카메라나 렌더러처럼 R3F가 이미 스토어에 넣어둔 것은 이렇게 등록할 필요가 없다. `useThree((s) => s.camera)`로 밖에서도 꺼낼 수 있다. `OrbitControls`에 `makeDefault`를 주면 컨트롤도 마찬가지로 스토어에 올라간다.

## 폴더 구조

---

```javascript
├─ scene/
  ├─ Scene.tsx         # 씬 루트. 조명·환경·컨트롤
  ├─ layers/
  │  ├─ VesselLayer.tsx
  │  ├─ RouteLayer.tsx
  │  └─ TerrainLayer.tsx
  ├─ objects/
  │  ├─ Vessel.tsx
  │  └─ Marker.tsx
  └─ systems/          # 렌더 없는 로직 컴포넌트 (null 반환)
     ├─ CameraController.tsx
     ├─ TelemetryBridge.tsx
     └─ PerformanceGuard.tsx
```

역할별로 나뉘어 있다.

- `Scene.tsx`는 씬 전체에 걸리는 것들만 둔다. 조명, 환경맵, 컨트롤, 후처리.
- `layers/`는 켜고 끄는 단위다. 데이터 배열을 받아 `objects/`의 컴포넌트를 뿌리는 역할이라 `visible` 토글이 여기 붙는다.
- `objects/`는 하나의 사물이다. 자기 애니메이션과 이벤트를 스스로 갖는다.
- `systems/`는 `null`을 반환하는 것들이다.

`Canvas`는 이 트리 바깥에 두는 편이 좋다. 캔버스를 담는 div의 크기, 픽셀 비율, 배경색 같은 것은 3D가 아니라 레이아웃 문제라서, 씬 루트와 섞으면 나중에 캔버스를 두 개 띄우거나 크기를 바꿀 때 걸린다.
