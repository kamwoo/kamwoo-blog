---
title: Events and Interaction
published: true
category: react-three-fiber
subtitle: Pointer events built on raycasting, why propagation goes through objects instead of up a tree, and how to keep interaction cheap
date: 2026-08-10
---

## 레이캐스트 위에 얹힌 이벤트

---

R3F의 포인터 이벤트는 DOM 이벤트가 아니라 매 포인터 이동마다 광선을 쏘는 [picking](/posts/picking)이다. 그래서 three의 raycast가 가진 성질을 그대로 물려받는다.

1. **비용이 씬 복잡도에 비례한다.** 검사 대상이 늘어나면 그만큼 느려진다.
2. **관통한 전부가 잡힌다.** 앞의 물체가 뒤의 물체를 가려주지 않는다.
3. **기하학적 판단이다.** 삼각형과 광선의 교차를 계산할 뿐이라, 투명한 부분이나 알파가 0인 픽셀도 맞는다.

DOM에서 오던 감각과 제일 크게 어긋나는 부분이 2번이다. DOM에서 클릭은 가장 위에 있는 하나의 요소에서 시작해 조상으로 버블링되지만, 여기서는 **광선에 맞은 모든 물체가 각자 이벤트를 받는다.** 카메라에 가까운 순서로 실행될 뿐이다.

## 사용 가능한 이벤트

---

```jsx
<mesh
  onClick={(e) => {}}
  onDoubleClick={(e) => {}}
  onContextMenu={(e) => {}}
  onPointerDown={(e) => {}}
  onPointerUp={(e) => {}}
  onPointerMove={(e) => {}}
  onPointerOver={(e) => {}}
  onPointerOut={(e) => {}}
  onPointerEnter={(e) => {}}   // 그룹 경계에 들어갈 때
  onPointerLeave={(e) => {}}   // 그룹 경계에서 나올 때
  onPointerMissed={(e) => {}}  // ray에 아무것도 안 맞았을 때
  onWheel={(e) => {}}
/>
```

**핸들러를 하나라도 붙이면 그 객체가 raycast 대상이 된다.** 핸들러가 없는 객체는 계산에서 아예 제외된다. 성능 관점에서 중요한 규칙이라, 핸들러를 무심코 붙이면 그만큼 매 프레임 비용이 붙는다고 생각하면 된다.

`onPointerMissed`는 DOM에 없는 이벤트다. 빈 공간을 클릭했을 때 선택을 해제하는 용도로 거의 항상 쓰게 된다.

## 이벤트 객체

---

| 필드 | 의미 |
| --- | --- |
| `object` | 광선에 맞은 객체 |
| `eventObject` | 핸들러가 붙어 있는 객체 (전파 중 구분용) |
| `point` | 교차 지점의 **월드 좌표** (Vector3) |
| `distance` | 카메라로부터의 거리 |
| `face` / `faceIndex` | 맞은 삼각형 면과 법선 |
| `uv` | 교차 지점의 UV 좌표 |
| `instanceId` | InstancedMesh에서 몇 번째 인스턴스인지 |
| `intersections` | **관통한 모든 교차의 배열** (거리순) |
| `ray` | 발사된 Ray |
| `unprojectedPoint` | 포인터를 언프로젝트한 지점 |
| `delta` | pointerdown부터 이동한 픽셀 거리 |
| `stopPropagation()` | 전파 중단 |

`object`와 `eventObject`의 구분이 유용하다. `<group>`에 핸들러 하나를 붙여두면 `eventObject`는 항상 그 그룹이고, `object`는 실제로 맞은 자식이다. 자식 수백 개에 핸들러를 각각 붙이는 대신 이 조합을 쓰면 검사 비용이 크게 줄어든다.

`uv`는 텍스처 위의 어느 지점을 눌렀는지 알려준다. 3D 공간에 얹은 화면이나 지도에서 좌표를 얻을 때 쓴다.

`delta`는 pointerdown 이후 움직인 픽셀 거리다. **드래그와 클릭을 구분할 때 이게 없으면 곤란하다.** OrbitControls로 카메라를 돌리고 손을 뗐을 뿐인데 물체가 선택되는 문제가 생기기 때문이다.

```tsx
onClick={(e) => {
  e.stopPropagation();
  if (e.delta > 5) return;  // 5px 이상 움직였으면 드래그로 본다
  onSelect(id);
}}
```

## stopPropagation

---

광선은 물체를 관통하기 때문에, 겹쳐 있는 물체들의 핸들러가 전부 실행된다. `stopPropagation`을 부르면 그 뒤에 있는 물체에서는 이벤트가 발생하지 않는다.

가장 앞의 것만 처리하는 다른 방법도 있다.

```javascript
onClick={(e) => {
  if (e.intersections[0].object !== e.object) return;
  // 여기서부터는 맨 앞의 물체
}}
```

`stopPropagation`이 더 간단하지만 부작용이 하나 있다. `onPointerOver`/`onPointerOut`에서 전파를 막으면 뒤에 있던 물체는 `out` 이벤트를 받지 못한 상태로 남아, hover 상태가 켜진 채 고착될 수 있다. 그래서 hover 계열은 `over`와 `out` 양쪽에서 일관되게 처리해야 한다.

## 히트박스

---

모든 물체에 대해 레이캐스트를 계산하면 비싸다. 모델 하나가 삼각형 5만 개라면 포인터를 움직일 때마다 5만 번의 교차 판정이 돈다.

보이지 않는 박스를 겹쳐두고 그 박스만 검사하도록 하는 것이 정석이다.

```jsx
<group>
  {/* 실제 모델: 검사 제외 */}
  <primitive object={shipModel} raycast={null} />

  {/* 히트박스: 삼각형 12개짜리 박스 */}
  <mesh visible={false} onClick={handleClick}>
    <boxGeometry args={[4, 2, 8]} />
  </mesh>
</group>
```

`raycast={null}`이 검사에서 빼는 방법이고, `visible={false}`인 mesh는 **그려지지 않지만 레이캐스트에는 잡힌다.** 이 두 성질을 조합한 패턴이다.

정밀한 판정이 꼭 필요하다면 drei의 `Bvh`로 가속 구조를 씌우는 방법도 있다. 삼각형을 전부 도는 대신 공간 분할 트리를 타기 때문에 훨씬 빠르다.

## 성능

---

**매 프레임 값을 상태에 넣지 않는다**

`onPointerMove`는 포인터가 움직이는 동안 계속 발생한다. 여기서 `setState`를 부르면 그때마다 재조정이 돈다.

```javascript
// 나쁨: 마우스 움직일 때마다 재조정
onPointerMove={(e) => setPoint(e.point)}

// 좋음: ref에 저장하고 useFrame에서 소비
const pointRef = useRef(new THREE.Vector3());
onPointerMove={(e) => pointRef.current.copy(e.point)}
```

`copy`를 쓰는 것도 이유가 있다. `e.point`를 그대로 대입하면 매번 새 `Vector3` 객체가 쌓인다. 기존 객체에 값만 복사하면 할당이 생기지 않는다.

**인터랙티브 객체를 줄인다**

핸들러가 붙은 객체가 500개면 매번 500개를 검사한다.

- `InstancedMesh` 하나로 그리고 `e.instanceId`로 구분한다.
- 부모 `<group>`에 핸들러 하나를 붙이고 `e.object`로 어느 자식인지 판별한다.

**Points와 Line은 임계값이 필요하다**

점과 선은 두께가 0이라 광선에 정확히 맞추기가 사실상 불가능하다. 임계값을 줘야 한다.

```jsx
<Canvas raycaster={{ params: { Points: { threshold: 0.2 } } }}>
```

**이벤트 핸들러는 stale closure다**

핸들러 안의 state는 그 핸들러가 만들어진 시점의 값이다. 렌더 사이에 값이 바뀌었다면 최신값이 아니다. `useThree`의 `get`으로 읽으면 항상 현재 값을 얻는다.

## 실제로 만들어본 선택 가능한 박스

---

위의 내용을 한 컴포넌트에 모아 놓은 연습이다.

```tsx
import { Html } from '@react-three/drei';
import { useFrame, type ThreeElements } from '@react-three/fiber';
import { useRef, useState } from 'react';
import type { Mesh } from 'three';

type SelectableBoxProps = ThreeElements['mesh'] & {
  id: string;
  selected: boolean;
  onSelect: (id: string | null) => void;
};

export const SelectableBox = (props: SelectableBoxProps) => {
  const { id, selected, onSelect, ...rest } = props;
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<Mesh>(null);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    meshRef.current.position.y += delta * 0.1;
  });

  return (
    <mesh
      {...rest}
      ref={meshRef}
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        if (e.delta > 5) return;
        onSelect(id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => {
        setHovered(false);
      }}
      onPointerMissed={() => onSelect(null)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={selected ? '#4a90d9' : hovered ? '#e0b45f' : '#8a8f98'}
        emissive={selected ? '#1a3a5c' : '#000000'}
        roughness={0.4}
      />
      {selected && (
        <Html position={[0, 0.9, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{ background: '#000c', color: '#fff', padding: '4px 10px', borderRadius: 6 }}>
            {id} 선택됨
          </div>
        </Html>
      )}
    </mesh>
  );
};
```

몇 가지 의도가 들어가 있다.

- `hovered`와 `selected`를 나눠서, hover는 컴포넌트 내부 상태로 두고 선택은 부모가 관리한다. 선택은 다른 형제와 배타적이어야 하기 때문이다.
- `onPointerOut`에서는 `stopPropagation`을 부르지 않는다. 앞서 말한 hover 고착을 피하기 위해서다.
- 라벨의 `pointerEvents: 'none'`이 중요하다. **`Html`이 얹힌 영역은 DOM이 위에 깔리는 것이라 그 자리에서는 3D 클릭이 막힌다.** 라벨이 박스 위를 덮으면 정작 박스를 클릭할 수 없게 된다.
- `ThreeElements['mesh']`를 확장해서 `position` 같은 표준 props를 그대로 받게 했다. 나머지를 `{...rest}`로 넘기면 호출부에서 평범한 mesh처럼 쓸 수 있다.

`useFrame`에서 y를 계속 더하는 부분은 프레임 시계 쪽이고, `selected`가 바뀌어 색이 바뀌는 것은 React 시계 쪽이다. 한 컴포넌트 안에서 두 시계가 각자 자기 일을 하고 있다.
