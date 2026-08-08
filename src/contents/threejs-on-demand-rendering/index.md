---
title: On-Demand Rendering
published: true
category: three.js
subtitle: The waste of an always-running requestAnimationFrame loop and rendering only when something changes
date: 2026-08-02
---

## 문제

---

보통 렌더링을 할 때 `requestAnimationFrame`을 사용하게 된다.

```jsx
function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

애니메이션을 사용하지 않을 경우에는 이 루프가 계속 돌아가는 것이 리소스 낭비를 유발한다.

정지된 장면을 초당 60번 다시 그리는 것은 매번 같은 결과를 만드는 작업이다. 결과가 같은데 GPU와 CPU는 계속 일하고 있으니, 배터리가 닳고 팬이 돌고 다른 탭까지 느려진다. 제품 뷰어나 데이터 시각화처럼 사용자가 조작할 때만 화면이 바뀌는 경우에 특히 손해가 크다.

## 필요할 때만 렌더링하기

---

OrbitControls 같은 컨트롤의 `change` 이벤트나 window의 `resize` 이벤트 콜백으로 렌더링을 하도록 하면, 문제없이 돌릴 수 있다.

```jsx
const controls = new OrbitControls(camera, renderer.domElement);

controls.addEventListener('change', render);
window.addEventListener('resize', render);

function render() {
  resizeRendererToDisplaySize(renderer);
  renderer.render(scene, camera);
}

render(); // 최초 1회
```

이렇게 하면 사용자가 마우스를 움직이는 동안에만 프레임이 그려지고, 손을 떼면 바로 멈춘다.

## 중복 호출 막기

---

위 방식에는 문제가 하나 있다. `change` 이벤트가 한 프레임에 여러 번 발생하면 그만큼 렌더링도 여러 번 일어난다.

렌더링 요청을 예약하는 형태로 감싸면 프레임당 한 번으로 정리된다.

```jsx
let renderRequested = false;

function requestRender() {
  if (renderRequested) return;

  renderRequested = true;
  requestAnimationFrame(render);
}

function render() {
  renderRequested = false;
  renderer.render(scene, camera);
}

controls.addEventListener('change', requestRender);
window.addEventListener('resize', requestRender);
```

플래그를 `render` 안에서 먼저 내리는 것이 중요하다. 렌더링 도중에 새 요청이 들어오면 다음 프레임에 다시 그려져야 하기 때문이다.

## damping을 쓸 때

---

`enableDamping`을 켜면 마우스를 놓은 뒤에도 관성으로 카메라가 계속 움직인다. 그런데 이때는 `change` 이벤트가 발생하지 않으므로 화면이 멈춰버린다.

이 경우에는 관성이 남아 있는 동안만 루프를 도는 형태로 만든다.

```jsx
function render() {
  renderRequested = false;

  if (controls.update()) {
    requestRender(); // 아직 움직이는 중이면 다음 프레임 예약
  }

  renderer.render(scene, camera);
}
```

`controls.update()`는 실제로 변화가 있었는지를 boolean으로 돌려준다. 이 값을 이용하면 멈추는 시점을 따로 판단할 필요가 없다.

## 다른 트리거들

---

카메라 조작 외에도 화면을 다시 그려야 하는 시점이 있다.

- GUI에서 값을 바꿨을 때 → `gui.onChange(requestRender)`
- 텍스처나 모델 로딩이 끝났을 때 → 로더 콜백에서 `requestRender()`
- 창 크기나 레이아웃이 바뀌었을 때 → `ResizeObserver`에서 `requestRender()`

로딩 완료 시점을 빠뜨리는 경우가 흔한데, 이러면 모델을 다 받아놓고도 화면에 나타나지 않는다. 상시 루프를 쓸 때는 자동으로 해결되던 것이 on-demand로 바꾸면 드러나는 문제다.

## 탭이 보이지 않을 때

---

`requestAnimationFrame`은 탭이 백그라운드로 가면 브라우저가 알아서 호출을 멈춘다. 그래서 상시 루프를 쓰더라도 보이지 않는 탭에서 계속 그려지지는 않는다.

다만 멈춰 있던 시간이 delta에 한 번에 몰리는 문제는 남는다. 이 부분은 `Timer`를 쓰거나, 복귀 시 delta에 상한을 두는 방식으로 처리한다.

```jsx
const delta = Math.min(timer.getDelta(), 0.1);
```

## 정리

---

- 애니메이션이 없는 장면이라면 상시 루프를 쓸 이유가 없다.
- 이벤트로 렌더링을 트리거하되, 프레임당 한 번으로 묶는다.
- damping을 쓴다면 `controls.update()`의 반환값으로 루프를 이어간다.
- 로딩 완료, GUI 변경 같은 트리거를 빠뜨리지 않는지 확인한다.
