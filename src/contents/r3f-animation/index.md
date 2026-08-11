---
title: Animation
published: true
category: react-three-fiber
subtitle: useFrame, spring, useAnimations로 나누는 네 층
date: 2026-08-10
---

## 네 가지 층위

---

R3F에서 움직임을 만드는 방법은 크게 넷으로 나뉜다. 무엇을 쓸지 헷갈릴 때는 **무엇이 진행률을 정하는가**를 기준으로 고르면 된다.

| 층위 | 방법 | 성격 |
| --- | --- | --- |
| ① 수동 | `useFrame` + 수학 | 완전 통제, 절차적 움직임 |
| ② 선언형 | react-spring / motion | 상태 전환에 반응하는 UI 애니메이션 |
| ③ 클립 재생 | `useAnimations` | 디자이너가 만든 애니메이션 재생 |
| ④ 외부 구동 | ScrollControls, 데이터 연동 | 시간이 아닌 다른 것이 진행률을 정함 |

## useFrame으로 직접 만들기

---

### 시간 기반과 상태 누적

```javascript
useFrame((state, delta) => {
  const t = state.clock.getElapsedTime();

  // 시간의 함수 — 주기적, 결정론적, 누적 오차 없음
  meshRef.current.position.y = Math.sin(t * 2) * 0.3;
  meshRef.current.rotation.z = Math.sin(t * 1.5) * 0.1;

  // 상태 누적 — 상호작용, 물리
  velocity.current += acceleration * delta;
  meshRef.current.position.x += velocity.current * delta;
});
```

두 방식의 차이가 중요하다.

- 되감기가 가능해야 하거나 특정 시각의 값을 알아야 하면 → **시간 기반**
- 외부 입력에 반응해 경로가 달라져야 하면 → **상태 누적**

시간 기반은 `f(t)` 형태라 어느 시점의 값이든 바로 구할 수 있고, 프레임을 몇 개 건너뛰어도 결과가 어긋나지 않는다. 상태 누적은 프레임마다 조금씩 더하는 방식이라 유연한 대신 **프레임 드랍이 결과를 바꾼다.** 물리 시뮬레이션에서 고정 타임스텝을 쓰는 이유도 이것이다.

### easing

three.js의 `MathUtils`에 기본적인 것들이 들어 있다.

- `damp(current, target, lambda, delta)`: 지수 감쇠, 프레임 독립
- `lerp(a, b, alpha)`: 선형 보간. `alpha`를 고정값으로 쓰면 프레임률에 따라 속도가 달라지니 주의
- `smoothstep(x, min, max)`: 부드러운 0→1
- `clamp(v, min, max)`
- `mapLinear(x, a1, a2, b1, b2)`: 범위 재매핑

`lerp`의 함정이 흔하다. `position.lerp(target, 0.1)`을 매 프레임 부르면 120Hz에서는 60Hz의 두 배 속도로 수렴한다. 프레임률과 무관하게 만들려면 `1 - Math.exp(-k * delta)`를 alpha로 쓰거나 `damp` 계열을 쓴다.

실제로는 `maath`의 easing을 쓰는 것이 편하다. 타입별로 함수가 나뉘어 있다.

```javascript
// Vector3
easing.damp3(meshRef.current.position, [x, y, z], 0.25, delta);

// Euler
easing.dampE(meshRef.current.rotation, [rx, ry, rz], 0.3, delta);

// Color
easing.dampC(materialRef.current.color, '#ff6600', 0.2, delta);

// 스칼라 속성
easing.damp(materialRef.current, 'opacity', 1, 0.2, delta);

// 방위각 회전 — 최단 경로로 돈다
easing.dampAngle(meshRef.current.rotation, 'y', target.current.heading, 0.4, delta);
```

세 번째 인자가 수렴에 걸리는 대략적인 시간이다. `0.25`면 4분의 1초 안에 목표에 거의 도달한다는 뜻이다. 마지막 인자로 `delta`를 넘기므로 프레임률이 달라져도 같은 속도로 수렴한다.

`dampAngle`이 따로 있는 이유는 각도가 순환하기 때문이다. 350도에서 10도로 갈 때 그냥 보간하면 340도를 거꾸로 돌지만, `dampAngle`은 20도만 돌아 최단 경로를 택한다.

### 회전은 쿼터니언으로

객체가 어떤 방향을 바라보게 할 때는 오일러 각보다 쿼터니언이 낫다. 오일러 각은 축 순서에 따라 결과가 달라지고, 특정 각도에서 자유도가 하나 사라지는 짐벌락이 생긴다.

```javascript
const targetQuat = useRef(new THREE.Quaternion());
const tempObject = useMemo(() => new THREE.Object3D(), []);

useFrame((_, delta) => {
  tempObject.position.copy(meshRef.current.position);
  tempObject.lookAt(targetPosition);
  targetQuat.current.copy(tempObject.quaternion);

  meshRef.current.quaternion.slerp(targetQuat.current, 1 - Math.exp(-5 * delta));
});
```

`tempObject`는 목표 회전값을 계산하기 위한 임시 객체다. `lookAt`을 실제 mesh에 바로 걸면 즉시 방향이 꺾이므로, 더미에 계산시킨 뒤 그 회전값으로 `slerp`한다.

`useMemo`로 더미를 만드는 이유는 매 프레임 `new`를 피하기 위해서다. 프레임 루프 안에서 객체를 생성하면 초당 60개씩 쓰레기가 쌓여 GC가 주기적으로 튄다. **`useFrame` 안에서는 가능한 한 할당을 만들지 않는다**는 원칙을 지키는 편이 좋다.

`1 - Math.exp(-5 * delta)`가 프레임 독립적인 alpha를 만드는 공식이다. 5가 클수록 빠르게 수렴한다.

## react-spring

---

상태가 바뀔 때 자동으로 전환되는 움직임이 필요하면 스프링이 맞다. 클릭하면 커지고, 선택되면 색이 바뀌는 종류다.

핵심은 **상태가 바뀔 때 한 번만 리렌더되고, 이후에는 값을 받아 매 프레임 객체를 직접 수정한다**는 점이다. 애니메이션 도중에 React가 개입하지 않는다.

```tsx
import { useSpring, animated } from '@react-spring/three';

function ClickableBox() {
  const [active, setActive] = useState(false);

  const { scale, color, positionY } = useSpring({
    scale: active ? 1.6 : 1,
    color: active ? '#4a90d9' : '#e07a3f',
    positionY: active ? 1 : 0,
    config: { mass: 1, tension: 280, friction: 24 },
  });

  return (
    <animated.mesh
      scale={scale}
      position-y={positionY}
      onClick={() => setActive(!active)}>
      <boxGeometry />
      <animated.meshStandardMaterial color={color} />
    </animated.mesh>
  );
}
```

`animated.` 접두어가 붙은 태그만 스프링 값을 받을 수 있다. 재질에도 따로 붙여야 한다는 점을 놓치기 쉽다.

`position-y`처럼 [pierced props](/posts/JSX%20Mapping%20Rules)를 쓰면 y축만 애니메이션하고 나머지는 그대로 둘 수 있다.

`config`는 물리 파라미터다. `mass`는 무게, `tension`은 스프링의 세기, `friction`은 감쇠다. 프리셋도 있다: `config.wobbly`, `config.stiff`, `config.slow`, `config.molasses`.

지속 시간을 지정하는 이징과 달리 스프링은 **중간에 목표가 바뀌어도 자연스럽게 이어진다.** 애니메이션이 끝나기 전에 다시 클릭해도 튀지 않는다. 상태 기반 UI에 스프링이 어울리는 이유다.

## useAnimations

---

모델에 들어 있는 클립을 재생할 때 쓴다. 훅이 해주는 일은 셋이다.

- `AnimationMixer` 생성
- 프레임마다 mixer 업데이트
- 언마운트 시 정리

```tsx
import { useAnimations, useGLTF } from '@react-three/drei';

function Robot() {
  const group = useRef<THREE.Group>(null!);
  const { scene, animations } = useGLTF('/robot.glb');
  const { actions, names, mixer } = useAnimations(animations, group);

  useEffect(() => {
    actions[names[0]]?.reset().fadeIn(0.3).play();
    return () => { actions[names[0]]?.fadeOut(0.3); };
  }, [actions, names]);

  return <group ref={group}><primitive object={scene} /></group>;
}
```

두 번째 인자로 넘기는 `ref`가 애니메이션의 루트다. **클립의 트랙 이름이 이 루트 아래의 객체 이름과 맞아야 한다.** 모델 구조를 감싸는 그룹을 잘못 잡으면 재생은 되는데 아무것도 움직이지 않는다.

`fadeIn`/`fadeOut`은 가중치를 0에서 1로 올리고 내리는 것이다. `play()`만 부르면 첫 포즈로 뚝 끊어져 들어간다.

### Action API

```javascript
action.play();
action.stop();
action.reset();

action.setLoop(THREE.LoopRepeat, Infinity);   // LoopOnce, LoopPingPong
action.clampWhenFinished = true;              // LoopOnce에서 마지막 프레임 유지
action.timeScale = 1.5;                       // 재생 속도
action.time = 0.5;                            // 특정 시점으로 스크럽
action.weight = 0.5;                          // 블렌딩 가중치
action.setEffectiveTimeScale(2);
```

`clampWhenFinished`가 없으면 `LoopOnce` 클립이 끝난 뒤 첫 프레임으로 돌아간다. 문을 여는 동작처럼 끝 상태가 유지되어야 하는 경우에는 반드시 켠다.

`weight`로 두 클립을 섞을 수 있다. 걷기와 뛰기를 0.5씩 섞으면 중간 속도의 동작이 나온다.

### crossFade

동작을 바꿀 때 툭 끊기는 것을 줄여준다.

```tsx
const [state, setState] = useState<'Idle' | 'Walk' | 'Run'>('Idle');
const prev = useRef(state);

useEffect(() => {
  const from = actions[prev.current];
  const to = actions[state];
  if (!to) return;

  to.reset().play();
  if (from && from !== to) {
    from.crossFadeTo(to, 0.4, true);   // 0.4초에 걸쳐 교차 페이드
  }
  prev.current = state;
}, [state, actions]);
```

세 번째 인자 `true`가 warping이다. 걷기와 뛰기처럼 리듬이 다른 동작을 전환할 때 재생 속도까지 맞춰가며 섞어주므로, 전환 도중 발이 미끄러지는 현상이 줄어든다.

`gltfjsx`에 `--types`를 주면 클립 이름이 유니온 타입으로 생성되므로 위처럼 문자열 상태로 관리하기 좋다.

### 여러 개 배치할 때

애니메이션이 있는 모델은 복제본마다 독립적인 믹서와 스켈레톤이 필요하다. 그냥 `Clone`으로 복제하면 스켈레톤을 공유해서 전부 똑같이 움직인다.

`SkeletonUtils.clone`으로 복제한 뒤 그 결과를 `useAnimations`에 넣어야 각자 다른 동작을 재생할 수 있다. [Loading Models and Textures](/posts/Loading%20Models%20and%20Textures)에서 본 `gltfjsx` 생성 코드가 이미 이 패턴으로 되어 있다.

```tsx
const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
const { nodes, materials } = useGraph(clone) as GLTFResult;
const { actions } = useAnimations(animations, group);
```

## 실시간 데이터 연동

---

외부에서 초당 수십 회 갱신되는 값을 씬에 반영하는 구조다. 소켓으로 위치가 들어오는 경우가 대표적이다.

문제가 두 가지 있다. **데이터가 오는 주기와 프레임 주기가 다르고**, 데이터가 올 때마다 상태를 갱신하면 재조정이 그만큼 돈다. 값을 그냥 대입하면 위치가 뚝뚝 끊어져 보인다.

해법은 목표값을 `ref`에 받아두고, 보간은 프레임에서 하는 것이다.

```tsx
function TestMesh({ id }: { id: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const target = useRef({ x: 0, z: 0, heading: 0 });

  useEffect(() => {
    return subscribe(id, (data) => {
      target.current.x = data.x;
      target.current.z = data.z;
      target.current.heading = data.heading;
    });   // 리렌더 없음
  }, [id]);

  useFrame((_, delta) => {
    easing.damp(meshRef.current.position, 'x', target.current.x, 0.3, delta);
    easing.damp(meshRef.current.position, 'z', target.current.z, 0.3, delta);
    easing.dampAngle(meshRef.current.rotation, 'y', target.current.heading, 0.4, delta);
  });

  return <mesh ref={meshRef}>...</mesh>;
}
```

이 구조의 장점은 데이터가 몇 초간 끊겨도 화면이 멈추지 않는다는 것이다. 마지막 목표를 향해 계속 수렴하고 있을 뿐이라 부드럽게 정지한다. 데이터가 다시 오면 그 지점으로 자연스럽게 이어진다.

`heading`에 `dampAngle`을 쓴 것도 앞서 말한 이유다. 방위각이 359도에서 1도로 넘어갈 때 한 바퀴 되돌지 않는다.

`subscribe`가 해제 함수를 돌려주도록 만들어 `useEffect`에서 그대로 반환하면 정리 코드가 짧아진다.

## 세 가지를 한 씬에

---

앞의 층위들을 한 화면에 올려놓고 비교해봤다. 도넛은 `useFrame`으로 떠 있고, 원판은 클릭하면 스프링으로 커지며, 구는 1초마다 바뀌는 목표를 향해 감쇠하며 따라간다.

<div align='center'>
<video src="/videos/posts/r3f-animation/animation.mov" height="400" controls></video>
</div>

**① 시간의 함수로 떠 있는 도넛**

```tsx
export const Floater = ({ index }: { index: number }) => {
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const t = clock.getElapsedTime() + index * 0.9;
    meshRef.current.position.y = Math.sin(t) * 0.25 + 0.6;
    meshRef.current.rotation.y = t * 0.4;
  });

  return (
    <mesh ref={meshRef} position-x={(index - 1) * 2} castShadow>
      <torusGeometry args={[0.3, 0.1, 96, 24]} />
      <meshStandardMaterial color='#8a929c' roughness={0.2} metalness={0.8} />
    </mesh>
  );
};
```

전부 `f(t)`다. `index * 0.9`를 시간에 더해 위상만 어긋나게 하면 컴포넌트 하나로 셋의 리듬을 다르게 만들 수 있다. 상태를 누적하지 않으니 프레임이 몇 개 밀려도 세 개의 간격이 틀어지지 않는다.

`position-x`는 [pierced props](/posts/JSX%20Mapping%20Rules)다. y는 매 프레임 직접 쓰고 x는 JSX로 한 번만 정하는 식으로 나눠뒀다.

**② 클릭에 반응하는 스프링 원판**

```tsx
export const Pad = ({ x }: { x: number }) => {
  const [on, setOn] = useState(false);

  const { scale, color, emissiveIntensity } = useSpring({
    scale: on ? 1.25 : 1,
    color: on ? '#4a90d9' : '#3a4048',
    emissiveIntensity: on ? 1.5 : 0,
    config: { tension: 300, friction: 18 },
  });

  return (
    <animated.mesh
      position={[x, 0.05, 0]}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        setOn((on) => !on);
      }}
      receiveShadow>
      <cylinderGeometry args={[0.7, 0.7, 0.1, 48]} />
      <animated.meshStandardMaterial
        color={color}
        emissive='#4a90d9'
        emissiveIntensity={emissiveIntensity}
        roughness={0.4}
      />
    </animated.mesh>
  );
};
```

리렌더는 `on`이 바뀔 때 한 번뿐이고, 그 뒤의 전환은 스프링이 프레임마다 객체를 직접 고쳐서 만든다. `emissiveIntensity`처럼 재질 속성에 스프링을 걸려면 `meshStandardMaterial` 쪽에도 `animated.`를 붙여야 한다. 겉의 mesh에만 붙이면 색과 발광은 아무 반응이 없다.

`stopPropagation`은 [광선이 원판을 관통해](/posts/Events%20and%20Interaction) 뒤의 것까지 켜지는 것을 막는다.

**③ 목표를 좇는 구**

```tsx
const WAYPOINTS = [
  { x: 1, z: 1 },
  { x: 1, z: -1 },
  { x: -1, z: -1 },
  { x: -1, z: 1 },
];

export const Chaser = () => {
  const meshRef = useRef<Mesh>(null);
  const positionRef = useRef({ x: 0, y: 0.35, z: 0 });
  const indexRef = useRef(0);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;
    const { x, y, z } = positionRef.current;

    easing.damp3(meshRef.current.position, [x, y, z], 0.35, delta);
  });

  useEffect(() => {
    const id = setInterval(() => {
      const { x, z } = WAYPOINTS[indexRef.current];
      positionRef.current = { x, y: 0.35, z };
      indexRef.current = (indexRef.current + 1) % WAYPOINTS.length;
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.3, 48, 24]} />
      <meshStandardMaterial color='#e07a3f' roughness={0.15} metalness={0.6} />
    </mesh>
  );
};
```

앞 절의 실시간 데이터 구조를 `setInterval`로 흉내낸 것이다. 소켓 대신 타이머가 목표를 던지고 있을 뿐, **목표는 ref에 넣고 보간은 프레임에서 한다**는 골격은 같다.

1초에 한 번만 값이 바뀌는데도 움직임이 끊기지 않는 이유가 여기에 있다. 목표가 순간이동해도 `damp3`가 0.35초에 걸쳐 따라가므로 화면에서는 연속된 이동으로 보인다. 목표를 `ref`에 두었으니 1초마다 리렌더가 일어나지도 않는다.

`indexRef`를 state로 두지 않은 것도 같은 이유다. 이 값은 화면에 나타나지 않고 다음 목표를 고르는 데만 쓰이므로, 상태로 만들면 재조정만 늘고 얻는 게 없다.
