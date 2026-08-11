---
title: picking
published: true
category: three.js
subtitle: Raycaster의 한계와 GPU에서 색으로 picking하기
date: 2026-08-06
---

## picking이란

---

사용자가 클릭 또는 터치한 물체를 가려내는 작업이다.

2D에서는 DOM이 알아서 해주는 일이지만, 3D에서는 캔버스 하나에 전부 그려져 있으므로 직접 판별해야 한다. 화면의 2D 좌표만으로는 어떤 물체를 가리키는지 알 수 없기 때문에, 3D 공간으로 되돌리는 계산이 필요하다.

## 광선 투사

---

커서에서 장면의 frustum으로 광선을 쏴, 광선이 닿는 물체를 감지하는 기법이다.

1. 포인터의 좌표를 구한다.
2. near 면에서 far 면까지 광선을 구해, 이 광선이 각 물체의 삼각형과 교차하는지 확인한다.

`Raycaster`가 이 작업을 해준다.

```jsx
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();

  // -1 ~ 1 범위로 정규화한다
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    console.log(intersects[0].object.name);
  }
}
```

좌표를 -1에서 1 범위로 바꾸는 이유는 이것이 클립 공간의 좌표계이기 때문이다. y를 뒤집는 것은 화면 좌표가 아래로 갈수록 커지는 반면 클립 공간은 위로 갈수록 커지기 때문이다.

`intersects`는 카메라에서 가까운 순으로 정렬되어 있어서, 맨 앞의 물체는 `intersects[0]`이다. 각 항목에는 교차 지점, 거리, 면 정보도 함께 들어 있다.

```jsx
intersects[0].point    // 교차한 3D 좌표
intersects[0].distance // 카메라로부터의 거리
intersects[0].face     // 교차한 삼각형
intersects[0].uv       // 교차 지점의 uv 좌표
```

`intersectObjects`의 두 번째 인자를 true로 주지 않으면 자식 객체를 검사하지 않는다. glTF처럼 계층이 있는 모델을 다룰 때 아무것도 잡히지 않는다면 이 부분을 확인한다.

## 광선 투사의 문제점

---

1. **CPU 자원을 사용한다.**
2. 특이한 방식의 셰이더나 변이를 감지하지 못한다.
3. 요소의 투명한 구멍을 처리하지 못한다.

1번은 물체 수에 비례해서 비용이 늘어난다는 뜻이다. Three.js가 경계 구체로 1차 걸러내기는 하지만, 통과한 물체는 삼각형 단위로 검사한다. 물체가 수천 개라면 마우스를 움직일 때마다 부담이 된다.

2번은 셰이더에서 정점을 움직인 경우다. GPU에서 변형된 결과는 화면에 보이지만, CPU가 들고 있는 geometry 데이터는 원래 위치 그대로다. 그래서 눈에 보이는 위치와 실제 판정 위치가 어긋난다. 스키닝 애니메이션이 적용된 모델도 같은 문제가 있다.

3번은 나뭇잎 텍스처처럼 알파로 뚫어놓은 부분이다. 광선 입장에서는 삼각형이 있으므로 맞았다고 판정하지만, 사용자 눈에는 구멍이라 뒤에 있는 것을 클릭했다고 느낀다.

## GPU 상에서 색상으로 피킹

---

카메라를 픽셀 하나만 렌더링하도록 해서 처리하는 방법이다.

`PerspectiveCamera.setViewOffset` 메서드를 사용하면 카메라의 특정 부분만 렌더링하도록 할 수 있다. scene을 2개 사용해야 한다. 하나는 기존 mesh용, 하나는 피킹용 material을 적용한 mesh용이다.

피킹용 카메라와 박스들이 있고, 해당 장면은 보이지 않게 한다. 그리고 각 박스에 색이 곧 id가 되게 설정한다. 그다음 렌더 타겟으로 1픽셀만 읽어서 해당 색을 토대로 현재 커서가 가리키는 박스를 결정한다.

```jsx
const pickingScene = new THREE.Scene();
const pickingTarget = new THREE.WebGLRenderTarget(1, 1);
const pixelBuffer = new Uint8Array(4);
const idToObject = {};

// 물체마다 고유한 id를 색으로 부여한다
scene.traverse((object) => {
  if (!object.isMesh) return;

  const id = nextId++;
  idToObject[id] = object;

  const pickingMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color().setHex(id),
  });

  pickingScene.add(new THREE.Mesh(object.geometry, pickingMaterial));
});
```

읽을 때는 커서 위치의 1픽셀만 렌더링한다.

```jsx
function pick(x, y) {
  const pixelRatio = renderer.getPixelRatio();

  camera.setViewOffset(
    renderer.domElement.width,   // 전체 너비
    renderer.domElement.height,  // 전체 높이
    x * pixelRatio | 0,          // 잘라낼 영역의 좌측
    y * pixelRatio | 0,          // 잘라낼 영역의 상단
    1,                           // 너비 1픽셀
    1,                           // 높이 1픽셀
  );

  renderer.setRenderTarget(pickingTarget);
  renderer.render(pickingScene, camera);
  renderer.setRenderTarget(null);

  camera.clearViewOffset();

  renderer.readRenderTargetPixels(pickingTarget, 0, 0, 1, 1, pixelBuffer);

  const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2];

  return idToObject[id];
}
```

`setViewOffset`을 쓰는 이유는 전체 화면을 다 그린 뒤 한 픽셀만 읽는 낭비를 피하기 위해서다. 카메라가 원래 그릴 영역 중 1픽셀짜리 창만 그리도록 좁히는 것이다. 다 쓴 뒤에는 `clearViewOffset`으로 되돌려야 화면이 정상으로 나온다.

## 두 방식의 비교

---

| | 광선 투사 | GPU 색상 피킹 |
| --- | --- | --- |
| 계산 위치 | CPU | GPU |
| 물체 수의 영향 | 비례해서 증가 | 거의 없음 |
| 셰이더 변형 | 감지 못 함 | 화면에 보이는 대로 판정 |
| 알파 구멍 | 처리 못 함 | 처리 가능 |
| 교차 좌표 | 얻을 수 있음 | 얻을 수 없음 |
| 구현 난이도 | 낮음 | 높음 (scene 2벌 관리) |

교차한 3D 좌표가 필요한 경우가 의외로 많다. 클릭한 지점에 무언가를 놓거나, 표면을 따라 마커를 붙이는 기능이 그렇다. 색상 피킹은 "무엇을 클릭했는가"만 알려주므로 이런 경우에는 광선 투사를 써야 한다.

## 정리

---

- 대부분의 경우 `Raycaster`로 충분하다. 먼저 이쪽으로 시작한다.
- 물체가 아주 많거나, 셰이더로 변형한 물체를 정확히 집어야 하면 GPU 색상 피킹을 검토한다.
- 색상 피킹의 핵심은 **id를 색으로 인코딩해서 1픽셀만 읽는 것**이고, 렌더 타겟이 그 바탕이 된다.
- hover를 구현할 때는 마우스 이동마다 피킹하지 말고 프레임당 한 번으로 묶는 것이 좋다.
