---
title: JSX Mapping Rules
published: true
category: react-three-fiber
subtitle: How R3F turns tags into classes, the difference between args and ordinary props, pierced props, attach, and when to reach for primitive
date: 2026-08-09
---

R3F에서 JSX를 쓰다 보면 "이건 왜 이렇게 써야 하지" 싶은 문법이 몇 개 나온다. 전부 three.js 객체를 선언형으로 다루기 위한 규칙이라, 규칙 다섯 개만 알면 나머지는 유추할 수 있다.

## 1. 태그 이름 → 클래스

---

R3F는 catalogue에 등록된 클래스 목록을 가지고 있고, JSX 태그 이름의 첫 글자를 대문자로 바꿔서 조회한다.

```javascript
<mesh />          → new THREE.Mesh()
<boxGeometry />   → new THREE.BoxGeometry()
<ambientLight />  → new THREE.AmbientLight()
```

three.js 네임스페이스 전체가 기본으로 등록되어 있어서, three가 새 클래스를 추가해도 R3F 업데이트를 기다릴 필요 없이 바로 쓸 수 있다.

three.js 본체에 없는 클래스, 예를 들어 `three-stdlib`나 직접 만든 클래스를 태그로 쓰려면 catalogue에 직접 등록한다.

```tsx
import { extend } from '@react-three/fiber';
import { EffectComposer } from 'three-stdlib';

extend({ EffectComposer });

// 이제 <effectComposer />를 쓸 수 있다
```

## 2. args는 생성자 인자

---

`args`는 `new`에 넘어가는 인자 배열이다.

```jsx
<boxGeometry args={[1, 1, 1]} />   // new THREE.BoxGeometry(1, 1, 1)
```

여기서 중요한 성질이 하나 있다. **`args`가 바뀌면 인스턴스가 재생성되고 교체된다.** 생성자 인자는 나중에 대입해서 바꿀 수 있는 값이 아니기 때문이다. R3F는 `args`를 얕은 비교로 확인해서, 달라졌으면 기존 객체를 버리고 새로 만든다.

그래서 크기를 자주 바꿔야 하는 상황에서 `args`를 애니메이션하면 매 프레임 geometry가 새로 만들어진다. 이럴 때는 `scale`을 쓰는 것이 맞다.

```jsx
{/* 나쁨: 값이 바뀔 때마다 geometry 재생성 */}
<boxGeometry args={[size, size, size]} />

{/* 좋음: 인스턴스는 그대로, 변환만 바뀜 */}
<mesh scale={size}>
  <boxGeometry args={[1, 1, 1]} />
</mesh>
```

얕은 비교라는 점도 함정이다. `args` 배열을 JSX 안에서 인라인으로 쓰면 매 렌더마다 새 배열이 만들어지지만, 얕은 비교는 배열 내부 요소를 비교하기 때문에 값이 같으면 재생성되지 않는다. 반대로 배열 안에 객체를 넣으면 매번 새 참조가 되어 계속 재생성된다.

## 3. 나머지 props는 생성 후 대입

---

`args`가 아닌 props는 인스턴스가 만들어진 뒤에 대입된다.

```jsx
<mesh position={[0, 1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
```

배열을 주면 `set(...)`으로 풀어서 넣어준다. `position={[0, 1, 0]}`은 `mesh.position.set(0, 1, 0)`이다. `Vector3` 인스턴스를 직접 넘겨도 되고, 스칼라 하나를 주면 `setScalar`처럼 동작한다.

```jsx
<mesh scale={2}>          {/* scale.setScalar(2) */}
<mesh scale={[1, 2, 1]}>  {/* scale.set(1, 2, 1) */}
```

색상처럼 문자열이 들어가는 자리는 three.js 생성자가 알아서 파싱한다. `color="#4a90d9"`, `color="red"`, `color={0x4a90d9}`가 전부 통한다.

## 4. pierced props

---

three.js에서 점으로 접근하는 중첩 속성을 prop에서 `-`로 쓸 수 있다.

```jsx
<mesh position-y={2} rotation-x={Math.PI / 2} material-color="tomato" />
```

각각 `mesh.position.y = 2`, `mesh.rotation.x = Math.PI / 2`, `mesh.material.color`에 대입하는 것과 같다.

이 문법이 생긴 이유는 three.js의 속성 상당수가 중첩 객체이기 때문이다. 이게 없으면 y만 바꾸고 싶어도 x, z까지 포함한 배열 전체를 넘겨야 한다. 특히 애니메이션 라이브러리와 붙일 때 유용하다. `position-y`처럼 스칼라 하나만 애니메이션하면 나머지 축은 건드리지 않는다.

깊이 제한은 없어서 `material-emissive-r` 같은 것도 된다. 다만 읽기 어려워지므로 두 단계 정도까지만 쓰는 편이다.

## 5. attach — child가 붙는 자리

---

`<mesh>` 안에 `<boxGeometry />`를 넣으면 자식으로 추가되는 것이 아니라 `mesh.geometry`에 대입된다. R3F가 이름 규칙으로 자동 판단하기 때문이다.

- `Geometry`로 끝나는 클래스 → 부모의 `geometry`
- `Material`로 끝나는 클래스 → 부모의 `material`

이 규칙 밖에 있는 것들은 `attach`로 명시해야 한다.

```jsx
<color attach="background" args={['#101010']} />
// scene.background = new THREE.Color(...)

<fog attach="fog" args={['#101010', 10, 50]} />

<mesh>
  {/* 멀티 머티리얼: material[0], material[1] */}
  <meshBasicMaterial attach="material-0" color="red" />
  <meshBasicMaterial attach="material-1" color="blue" />
</mesh>
```

`attach="material-0"`처럼 인덱스를 붙일 수 있는 것이 pierced props와 같은 문법이다. 큐브의 여섯 면에 각각 다른 재질을 줄 때 이렇게 쓴다.

함수형 `attach`도 있다.

```jsx
<somethingWeird
  attach={(parent, self) => {
    parent.register(self);
    return () => parent.unregister(self);
  }}
/>
```

반환값이 cleanup이다. 속성 대입이 아니라 등록과 해제 메서드를 부르는 API를 붙일 때 쓴다.

## 6. primitive

---

로더가 만들어준 객체나 명령형으로 만든 객체는 R3F가 생성할 수 없다. 이미 존재하는 인스턴스를 씬에 얹는 용도가 `primitive`다.

```jsx
const { scene } = useGLTF('/ship.glb');

return <primitive object={scene} position={[0, 0, 0]} />;
```

주의할 점이 몇 가지 있다.

- **`args`가 없다.** 이미 만들어진 객체를 받는 것이라 생성자를 부르지 않는다.
- **`object`가 매 렌더마다 새로 넘겨지면 씬 그래프가 매번 다시 만들어진다.** `useMemo`나 로더의 캐시로 참조를 고정해야 한다.
- **같은 객체를 두 개의 `primitive`에 넣는다고 두 개가 생기지 않는다.** `Object3D`는 부모를 하나만 가지므로, 두 번째 `primitive` 쪽으로 이동해버린다. 즉 첫 번째 자리에서 사라진다.

마지막 항목이 처음에 제일 헷갈렸다. 같은 모델을 여러 곳에 배치하려면 복제해야 하고, drei의 `Clone`을 쓰는 것이 가장 간단하다.

```tsx
import { Clone, useGLTF } from '@react-three/drei';

export const Llama = (props: ThreeElements['group']) => {
  const { scene } = useGLTF('/llama.glb');

  return (
    <group {...props}>
      <Clone object={scene} />
    </group>
  );
};
```

## 그 외에 알아둘 점

---

**props로 넘기는 것과 자식으로 넣는 것은 같다**

```jsx
{/* 둘은 같은 결과다 */}
<mesh geometry={geometry} material={material} />

<mesh>
  <boxGeometry />
  <meshStandardMaterial />
</mesh>
```

로더에서 받은 geometry와 material을 재사용할 때는 위쪽이 편하고, 값을 선언적으로 조절할 때는 아래쪽이 편하다.

**자동 dispose가 공유 리소스를 깨뜨릴 수 있다**

R3F는 언마운트할 때 자기가 만든 리소스를 자동으로 `dispose`한다. 편하지만, 여러 곳에서 공유하는 geometry나 texture라면 하나가 언마운트될 때 나머지도 같이 깨진다.

```jsx
<group dispose={null}>
  {/* 이 하위의 리소스는 자동 해제하지 않는다 */}
</group>
```

`gltfjsx`가 생성해주는 컴포넌트에 `dispose={null}`이 붙어 있는 것도 같은 이유다. 캐시된 geometry와 material을 참조만 하고 있으므로 해제하면 안 된다.
