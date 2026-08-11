---
title: Scene
published: true
category: three.js
subtitle: scene graph와 local, world 좌표, 행렬 갱신 시점
date: 2026-07-24
---

## Scene 그래프

---

Scene은 화면에 그릴 것들을 담는 최상위 컨테이너다. 하지만 단순한 배열이 아니라 **트리 구조**라는 점이 핵심이다. 이 트리를 Scene 그래프라고 부른다.

Scene, Mesh, Light, Camera, Group은 전부 `Object3D`를 상속받는다. 그래서 어떤 것이든 다른 것의 자식이 될 수 있다.

```jsx
const scene = new THREE.Scene();

const group = new THREE.Group();
const body = new THREE.Mesh(bodyGeometry, material);
const wheel = new THREE.Mesh(wheelGeometry, material);

group.add(body, wheel);
scene.add(group);
```

## 부모의 변환이 자식에게 누적된다

---

Scene 그래프가 트리인 이유는 **변환이 누적되기** 때문이다. 부모를 움직이면 자식도 함께 움직인다.

```jsx
group.position.x = 5;
group.rotation.y = Math.PI / 2;

// body와 wheel은 group을 기준으로 상대 위치를 유지한 채 함께 이동, 회전한다
```

태양계를 만든다고 하면 이 성질이 그대로 쓰인다. 태양 Object3D에 지구를 자식으로 붙이고, 지구에 달을 자식으로 붙인다. 그러면 태양을 회전시키는 것만으로 지구가 공전하고, 지구를 회전시키면 달이 지구를 따라 돈다. 각각의 궤도를 직접 계산할 필요가 없다.

```jsx
const solarSystem = new THREE.Object3D();
const earthOrbit = new THREE.Object3D();

earthOrbit.position.x = 10;
solarSystem.add(sunMesh, earthOrbit);
earthOrbit.add(earthMesh, moonOrbit);

scene.add(solarSystem);

// 루프에서
solarSystem.rotation.y += 0.01 * delta; // 지구가 태양을 돈다
earthOrbit.rotation.y += 0.05 * delta;  // 달이 지구를 돈다
```

## 로컬 좌표와 월드 좌표

---

여기서 좌표가 두 가지로 나뉜다.

- **로컬 좌표**: 부모를 기준으로 한 자기 위치. `object.position`이 이 값이다.
- **월드 좌표**: Scene 원점을 기준으로 한 최종 위치

`earthOrbit.position.x`가 10이어도, 부모인 `solarSystem`이 회전해 있으면 지구의 실제 월드 위치는 10이 아니다. 월드 좌표가 필요하면 별도로 꺼내야 한다.

```jsx
const worldPosition = new THREE.Vector3();
earthMesh.getWorldPosition(worldPosition);
```

두 물체 사이의 실제 거리를 재거나, 화면 좌표로 변환해서 HTML 라벨을 붙이는 작업에서 이 구분을 놓치면 값이 어긋난다.

## 행렬 갱신 시점

---

`position`, `rotation`, `scale`은 편의를 위한 값이고, 실제 GPU에 넘어가는 것은 이 값들로 만든 4x4 행렬이다. Three.js는 매 프레임 `render` 직전에 트리를 순회하며 이 행렬을 갱신한다.

문제는 **렌더링 전에 월드 좌표를 읽어야 할 때**다. 아직 행렬이 갱신되지 않았으므로 이전 프레임 값이 나온다.

```jsx
mesh.position.x = 100;

// 아직 반영되지 않은 값이 나올 수 있다
mesh.getWorldPosition(v);

// 강제로 갱신한 뒤 읽는다
mesh.updateMatrixWorld(true);
mesh.getWorldPosition(v);
```

반대로 위치가 거의 바뀌지 않는 물체가 아주 많다면, 자동 갱신을 끄고 필요할 때만 직접 갱신하는 방식으로 CPU 비용을 줄일 수 있다.

```jsx
staticMesh.matrixAutoUpdate = false;
staticMesh.updateMatrix(); // 위치를 바꾼 시점에 한 번만
```

## Scene 자체의 속성

---

Scene에도 장면 전체에 걸리는 설정이 있다.

```jsx
scene.background = new THREE.Color(0x111111);
scene.environment = envTexture; // PBR 재질의 반사에 사용되는 환경 맵
scene.fog = new THREE.Fog(0x111111, 10, 50);
```

`environment`는 `MeshStandardMaterial` 계열에서 특히 중요하다. 환경 맵이 없으면 금속 재질(metalness가 높은 재질)이 반사할 것이 없어서 거의 검게 보인다. 조명을 아무리 올려도 해결되지 않는데, 원인이 조명이 아니라 환경 맵이기 때문이다.

`fog`는 배경색과 같은 색으로 맞춰야 자연스럽다. 색이 다르면 멀리 있는 물체만 다른 색으로 흐려져서 어색해진다.

## 정리

---

- Scene은 배열이 아니라 트리이고, 부모의 변환은 자식에게 누적된다.
- 궤도나 관절처럼 상대 운동이 필요하면 빈 `Object3D`를 중간에 끼워 넣는 것이 가장 간단하다.
- `position`은 로컬 좌표다. 월드 좌표가 필요하면 `getWorldPosition`을 쓰고, 렌더 전이라면 `updateMatrixWorld`를 먼저 호출한다.
- 금속 재질이 검게 나온다면 조명이 아니라 `scene.environment`를 먼저 확인한다.
