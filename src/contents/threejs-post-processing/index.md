---
title: Post Processing
published: true
category: three.js
subtitle: Applying effects to what was drawn into a render target and the pass structure of EffectComposer
date: 2026-08-07
---

## 후처리란

---

2D 이미지에 효과나 필터를 넣는 것이다. 이미지를 렌더 타겟에 렌더링하고 캔버스에 보내기 전에 임의의 후처리 효과를 줄 수 있다.

3D로 그린 결과를 최종적으로는 2D 픽셀 덩어리로 보고, 거기에 포토샵 필터를 씌우는 것과 비슷하다. 3D 계산이 이미 끝난 뒤이므로 물체가 몇 개든 비용은 화면 픽셀 수에만 비례한다.

## EffectComposer

---

Three.js는 `EffectComposer`로 후처리를 관리한다. 효과 하나가 pass 하나에 대응하고, pass를 순서대로 등록하면 앞의 결과가 뒤로 넘어간다.

```jsx
const composer = new EffectComposer(renderer);

composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(resolution, 1.5, 0.4, 0.85));
composer.addPass(new OutputPass());

// 루프에서 renderer.render 대신
composer.render();
```

내부적으로는 렌더 타겟 두 개를 번갈아 쓴다. 하나에 그린 결과를 읽어서 다른 하나에 쓰고, 다음 pass에서는 역할을 바꾸는 방식이다. 렌더 타겟은 읽으면서 동시에 쓸 수 없기 때문에 이런 구조가 필요하다.

**pass의 역할**

- `RenderPass`: 장면을 실제로 그리는 첫 pass. 이게 없으면 입력 이미지 자체가 없다.
- 효과 pass들: bloom, 색보정, 외곽선 등
- `OutputPass`: 톤 매핑과 색공간 변환을 담당하는 마지막 pass

`OutputPass`를 빼먹으면 색이 어둡거나 채도가 이상하게 나온다. 후처리를 붙였더니 화면 톤이 달라졌다면 이 부분을 먼저 확인한다.

## 자주 쓰는 효과

---

- **Bloom**: 밝은 부분이 번지는 효과. 네온이나 발광체 표현에 쓴다.
- **Outline**: 선택된 물체에 외곽선을 그린다. 3D 뷰어에서 선택 상태를 표시할 때 유용하다.
- **SSAO**: 물체가 맞닿는 틈에 음영을 넣어 입체감을 살린다.
- **FXAA / SMAA**: 후처리 방식의 안티앨리어싱
- **Bokeh**: 심도 표현. 초점 밖을 흐린다.

## 안티앨리어싱 문제

---

후처리를 쓸 때 걸리는 지점이 있다. `WebGLRenderer`의 `antialias: true` 옵션은 **캔버스에 직접 그릴 때만** 적용된다. 후처리를 쓰면 렌더 타겟에 그리게 되므로 이 설정이 무시되고 계단이 다시 보인다.

해결 방법은 두 가지다.

1. `FXAAPass`나 `SMAAPass`를 후처리 체인에 추가한다.
2. 멀티샘플 렌더 타겟을 쓴다. WebGL2 환경에서는 `EffectComposer`가 `samples` 값을 지정하면 처리해준다.

```jsx
composer.renderTarget1.samples = 4;
composer.renderTarget2.samples = 4;
```

## 해상도와 비용

---

후처리는 화면 픽셀 수만큼 셰이더를 실행하는 작업이고, pass를 추가할 때마다 그만큼 반복된다. pass 5개면 전체 화면을 5번 훑는 셈이다.

그래서 비용을 줄이는 방법도 해상도 쪽에 있다.

- Bloom처럼 어차피 번지는 효과는 절반 해상도로 처리해도 티가 나지 않는다. `UnrealBloomPass`는 내부적으로 이미 축소 버전을 쓴다.
- 리사이즈 때 composer도 함께 크기를 갱신해야 한다.

```jsx
composer.setSize(width, height);
composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```

## on-demand 렌더링과 함께 쓸 때

---

필요할 때만 렌더링하는 구조를 쓰고 있다면, 후처리를 붙인 뒤에는 `renderer.render`가 아니라 `composer.render`를 호출하도록 바꿔야 한다. 바꾸지 않으면 효과가 적용되지 않은 화면이 나온다.

```jsx
function render() {
  renderRequested = false;
  composer.render();
}
```

## 정리

---

- 후처리는 렌더 타겟에 그린 2D 결과를 가공하는 것이라, 물체 수가 아니라 픽셀 수에 비례한다.
- pass 순서가 곧 처리 순서이고, `RenderPass`로 시작해 `OutputPass`로 끝낸다.
- 후처리를 켜면 `antialias` 옵션이 무효가 되므로 별도 처리가 필요하다.
- 리사이즈 시 `composer.setSize`를 잊지 않는다.
