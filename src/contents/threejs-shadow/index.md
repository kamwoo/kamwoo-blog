---
title: shadow
published: true
category: three.js
subtitle: shadow map의 동작과 그림자를 만드는 광원, 품질과 카메라 볼륨
date: 2026-07-30
---

## 그림자 맵

---

그림자를 만드는 빛의 영향을 받는 모든 물체를 **빛의 시점에서 렌더링**하는 기법이다.

조명 하나에 대해 모든 물체의 그림자를 한 번 렌더링한다. 그래서 보통 여러 조명이 있더라도 하나의 조명에 대해서만 그림자를 지게 한다.

원리를 풀어보면 이렇다.

1. 빛의 위치에 카메라를 두고 장면을 렌더링한다. 이때 색이 아니라 **깊이**만 텍스처에 기록한다. 이 텍스처가 그림자 맵이다.
2. 실제 카메라로 장면을 그릴 때, 각 픽셀이 빛에서 얼마나 떨어져 있는지를 계산한다.
3. 그 거리가 그림자 맵에 기록된 거리보다 멀면, 빛과 그 픽셀 사이에 무언가 있다는 뜻이므로 그림자다.

즉 그림자를 그리려면 장면을 최소 두 번 렌더링해야 한다. 조명 하나당 한 번씩 늘어나기 때문에 그림자 조명을 여러 개 두면 부하가 빠르게 커진다.

## 그림자를 만들 수 있는 조명

---

- **DirectionalLight** → OrthographicCamera를 사용한다
- **PointLight** → 6방향을 모두 렌더링해야 한다
- **SpotLight** → PerspectiveCamera를 사용한다

DirectionalLight가 정사영 카메라를 쓰는 이유는 광선이 평행하기 때문이고, SpotLight가 원근 카메라를 쓰는 이유는 한 점에서 원뿔로 퍼지기 때문이다. 그림자 카메라의 종류가 조명의 성격을 그대로 따라간다.

PointLight는 사방으로 빛이 나가므로 큐브맵 6면을 전부 렌더링해야 한다. 장면을 6번 더 그리는 셈이라 가장 비싸다. 가능하면 SpotLight로 대체하는 편이 낫다.

AmbientLight와 HemisphereLight는 방향이 없으므로 그림자를 만들 수 없고, RectAreaLight도 지원하지 않는다.

## 그림자 설정

---

그림자는 mesh로 직접 만들어서 물체와 Object3D로 묶는 방법도 있다. 하지만 빛의 방향에 따른 모양을 자연스럽게 만들기는 어렵다. 그래서 설정으로 만들 수도 있다.

1. `renderer.shadowMap.enabled = true`
2. `light.castShadow = true`
3. 각 mesh에 `castShadow`와 `receiveShadow`를 true

```jsx
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

light.castShadow = true;

mesh.castShadow = true;     // 그림자를 드리운다
ground.receiveShadow = true; // 그림자를 받는다
```

`castShadow`와 `receiveShadow`가 나뉘어 있는 이유는 비용 때문이다. 바닥은 그림자를 받기만 하면 되므로 굳이 그림자 맵 렌더링에 포함시킬 필요가 없다. 필요한 물체에만 켜는 것이 원칙이다.

## 그림자 품질과 카메라 공간

---

그림자 맵은 그림자가 포함된 하나의 텍스처다. 카메라 공간을 늘리면 이 텍스처가 담당해야 할 영역도 넓어진다. 즉 **카메라 공간이 커질수록 픽셀이 각지게 보이고, 공간을 작게 잡을수록 선명해진다.**

해상도는 고정인데 담당 면적만 늘어나니 단위 면적당 픽셀 수가 줄어드는 것이다. 1024x1024 그림자 맵이 10x10 영역을 담당하면 촘촘하지만, 1000x1000 영역을 담당하면 계단이 보인다.

그래서 그림자 카메라의 범위를 물체가 있는 영역에 딱 맞게 조이는 것이 가장 효과적인 개선 방법이다.

```jsx
const shadowCamera = light.shadow.camera;

shadowCamera.left = -10;
shadowCamera.right = 10;
shadowCamera.top = 10;
shadowCamera.bottom = -10;
shadowCamera.near = 1;
shadowCamera.far = 30;
shadowCamera.updateProjectionMatrix();
```

범위가 적절한지는 헬퍼로 눈으로 확인하는 것이 가장 빠르다.

```jsx
scene.add(new THREE.CameraHelper(light.shadow.camera));
```

해상도를 올리는 방법도 있지만 메모리를 그대로 먹으므로 범위를 조인 뒤에 고려한다.

```jsx
light.shadow.mapSize.set(2048, 2048);
```

## shadow acne와 peter panning

---

그림자를 켜면 흔히 만나는 두 가지 문제가 있다.

**shadow acne**는 평평한 면에 줄무늬 얼룩이 생기는 현상이다. 깊이 비교가 자기 자신에 대해 이루어지면서 정밀도 오차로 일부 픽셀이 그림자로 판정되기 때문이다. bias를 주면 비교 기준을 살짝 밀어서 해결한다.

```jsx
light.shadow.bias = -0.0005;
```

**peter panning**은 bias를 너무 많이 준 결과다. 그림자가 물체에서 떨어져 나가 물체가 공중에 뜬 것처럼 보인다. bias는 아주 작은 값부터 조금씩 올리면서 두 현상 사이의 지점을 찾아야 한다.

`normalBias`를 쓰면 면의 법선 방향으로 밀어내기 때문에 peter panning 없이 acne를 줄이기 쉽다.

## 정리

---

- 그림자는 장면을 한 번 더 렌더링하는 작업이다. 조명 하나에만 켜는 것이 기본이다.
- 품질 문제는 해상도보다 그림자 카메라의 범위를 먼저 조인다.
- 얼룩이 보이면 bias, 그림자가 떠 보이면 bias를 되돌린다.
- 정적인 장면이라면 그림자를 매 프레임 갱신할 필요가 없다. `light.shadow.autoUpdate = false`로 두고 필요할 때만 `needsUpdate`를 켜는 방법이 있다.
