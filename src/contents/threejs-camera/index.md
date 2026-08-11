---
title: Camera
published: true
category: three.js
subtitle: PerspectiveCamera의 절두체와 z-fighting
date: 2026-07-29
---

## PerspectiveCamera

---

4가지 속성으로 frustum(절두체)을 만든다.

- **near**: frustum이 어디서 시작할지
- **far**: frustum의 끝
- **fov**: field of view로, near와 카메라 사이의 거리에 따라 높이를 만든다
- **aspect**: frustum의 너비 비율

```jsx
const camera = new THREE.PerspectiveCamera(
  75,                                  // fov
  canvas.clientWidth / canvas.clientHeight, // aspect
  0.1,                                 // near
  1000,                                // far
);
```

frustum은 앞뒤가 잘린 피라미드 모양의 공간이고, 이 안에 들어온 것만 화면에 그려진다. near보다 가까운 것과 far보다 먼 것은 잘려 나간다.

속성을 바꾼 뒤에는 반드시 투영 행렬을 다시 계산해야 한다.

```jsx
camera.aspect = width / height;
camera.updateProjectionMatrix();
```

이걸 빼먹으면 값을 바꿔도 화면에 아무 변화가 없다. 화면 비율이 이상하게 늘어나 보이는 문제의 대부분이 여기서 나온다.

## 이런 설정이 있는 이유

---

near를 엄청 작게 하고 far를 엄청 크게 하면 항상 다 보이는 게 아닌가?

→ GPU는 어떤 물체가 앞에 있거나 다른 물체의 뒤에 있는지를 판별할 때 정밀도에 한계가 있다.

깊이 값은 깊이 버퍼라는 한정된 비트 수(보통 24비트)에 저장된다. 문제는 이 값이 near와 far 사이에 **균등하게 분포하지 않는다**는 것이다. 원근 투영의 특성상 near 근처에 정밀도가 몰리고 far로 갈수록 급격히 성기어진다.

그래서 near를 0.001처럼 아주 작게 잡으면, 정밀도의 대부분이 카메라 코앞의 좁은 구간에 소모되고 정작 물체가 있는 영역은 구분이 안 되는 상태가 된다.

**z-fighting**: GPU가 어떤 픽셀이 앞이고 뒤인지 판별할 정밀도가 모자랄 때 발생한다. 두 면이 거의 같은 깊이에 있을 때 화면이 지글거리며 번갈아 보이는 현상이다.

→ WebGLRenderer에 `logarithmicDepthBuffer`를 주면 해결되지만 성능이 나빠지고, 일부 GPU에서만 제대로 동작한다.

```jsx
const renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true });
```

이건 최후의 수단이고, 먼저 시도할 것은 near와 far를 조이는 쪽이다. 겹쳐 있는 면 자체를 떼어놓거나 `polygonOffset`을 쓰는 방법도 있다.

## best practice

---

**near는 대상이 보이는 한 가장 멀게, far는 대상이 보이는 한 가장 가깝게 설정해야 한다.**

near와 far의 비율이 정밀도를 결정하기 때문에, 특히 near를 키우는 것이 효과가 크다. near를 0.1에서 1로 바꾸는 것이 far를 10000에서 1000으로 줄이는 것보다 훨씬 큰 개선을 준다.

장면 규모가 극단적으로 넓어서(예: 우주나 지구 전체) 하나의 frustum으로 감당이 안 된다면, 카메라를 두 개 두고 가까운 물체와 먼 물체를 나눠 그린 뒤 합치는 방법을 쓴다.

## fov와 거리의 관계

---

fov를 줄이면 화각이 좁아져 망원 렌즈처럼 원근이 압축되고, 키우면 광각 렌즈처럼 원근이 과장된다. 물체를 화면에 같은 크기로 유지하면서 fov만 바꾸면 배경과의 거리감이 달라 보인다.

일반적인 3D 뷰어는 45도에서 75도 사이를 쓴다. 90도를 넘어가면 화면 가장자리가 심하게 늘어나 보인다.

## OrthographicCamera

---

정사영 카메라다. 절두체 대신 `left`, `right`, `top`, `bottom`, `near`, `far`로 육면체를 정의해 사용한다. 원근이 없다.

```jsx
const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
```

원근이 없다는 것은 거리와 무관하게 크기가 같다는 뜻이다. 그래서 이런 곳에 쓴다.

- 2D 화면
- 3D에서 옆, 앞, 뒤 등 도면을 표현할 때
- CAD나 아이소메트릭 시점의 게임
- 그림자 맵에서 DirectionalLight의 시점

마지막 항목이 특히 중요하다. DirectionalLight는 광선이 평행하므로, 그 시점에서 장면을 렌더링할 때도 원근이 없는 카메라를 써야 한다. 그래서 Three.js는 DirectionalLight의 그림자 카메라로 `OrthographicCamera`를 사용한다.

리사이즈 처리도 PerspectiveCamera와 다르다. aspect 속성이 없으므로 left와 right를 직접 조정한다.

```jsx
const aspect = width / height;

camera.left = -frustumSize * aspect / 2;
camera.right = frustumSize * aspect / 2;
camera.top = frustumSize / 2;
camera.bottom = -frustumSize / 2;
camera.updateProjectionMatrix();
```
