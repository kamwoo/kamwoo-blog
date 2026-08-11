---
title: Render Target
published: true
category: three.js
subtitle: 화면 대신 texture에 그리기와 그 활용
date: 2026-07-31
---

## 렌더 타겟이란

---

직접 렌더링할 수 있는 텍스처다.

작은 렌더러를 하나 만든다는 개념으로, 만들어진 결과는 텍스처로서 다른 물체나 타겟에 들어갈 수 있다.

평소에 `renderer.render(scene, camera)`를 호출하면 결과가 캔버스에 그려진다. 렌더 타겟을 지정하면 같은 작업의 결과가 캔버스 대신 텍스처에 기록된다. 그리고 그 텍스처를 다시 재질의 map으로 쓸 수 있다.

```jsx
const renderTarget = new THREE.WebGLRenderTarget(512, 512);

// 렌더 타겟에 먼저 그린다
renderer.setRenderTarget(renderTarget);
renderer.render(rtScene, rtCamera);

// 다시 화면으로 되돌린다
renderer.setRenderTarget(null);
renderer.render(scene, camera);
```

`setRenderTarget(null)`로 되돌리는 것을 빼먹으면 그다음 렌더링까지 텍스처에 그려져서 화면에 아무것도 나오지 않는다. 화면이 검게 나오는 경우 이 부분을 먼저 확인한다.

만들어진 텍스처는 `renderTarget.texture`로 꺼내 쓴다.

```jsx
const material = new THREE.MeshBasicMaterial({ map: renderTarget.texture });
```

## 용도

---

1. **그림자**: 빛의 시점에서 깊이를 기록하는 그림자 맵이 곧 렌더 타겟이다.
2. **피킹**: 물체마다 고유한 색을 칠해 렌더 타겟에 그리고, 커서 위치의 픽셀 하나를 읽어 어떤 물체인지 판별한다.
3. **후처리**: 장면을 일단 텍스처에 그린 뒤, 그 텍스처에 효과를 입혀 화면에 낸다.
4. 예를 들어 자동차 안의 백미러. 후방 카메라 시점으로 렌더 타겟에 그리고, 그 텍스처를 백미러 평면에 붙인다.

CCTV 모니터, 포털, 물 반사도 전부 같은 구조다. "다른 시점에서 본 장면이 화면 안의 물체에 나타나야 한다"면 렌더 타겟이 답이다.

## 캔버스 사이즈와 동기화

---

캔버스의 사이즈가 변경되었을 때, 렌더 타겟의 사이즈도 같이 늘려주어야 한다.

렌더 타겟은 생성 시점의 크기로 고정되기 때문에, 캔버스만 커지면 저해상도 텍스처를 늘려 쓰게 되어 뿌옇게 보인다.

```jsx
renderTarget.setSize(width, height);
rtCamera.aspect = width / height;
rtCamera.updateProjectionMatrix();
```

다만 렌더 타겟이 항상 캔버스와 같은 크기일 필요는 없다. 백미러처럼 화면에서 작게 보이는 용도라면 512x512 정도로 충분하고, 오히려 낮게 잡는 것이 이득이다. 렌더 타겟은 장면을 한 번 더 그리는 작업이라 해상도가 그대로 비용이 된다.

## 주의할 점

---

**렌더 타겟 안의 장면은 별도로 관리된다**

렌더 타겟에 그릴 때 쓰는 scene과 camera는 화면용과 달라도 되고, 같아도 된다. 백미러라면 같은 scene을 다른 camera로 그리면 되고, 피킹이라면 아예 다른 scene을 쓴다.

**자기 자신을 그릴 수는 없다**

렌더 타겟의 텍스처를 쓰는 물체가 그 렌더 타겟 안에 포함되어 있으면 안 된다. 읽으면서 동시에 쓰는 상황이라 GPU가 처리하지 못한다. 거울이 서로를 비추는 무한 반사를 만들려면 이전 프레임의 결과를 쓰는 식으로 렌더 타겟 두 개를 번갈아 사용해야 한다.

**깊이 정보가 필요하면 따로 요청한다**

기본 렌더 타겟은 색상만 텍스처로 꺼낼 수 있다. 후처리에서 깊이를 쓰려면 depthTexture를 붙여야 한다.

```jsx
renderTarget.depthTexture = new THREE.DepthTexture(width, height);
```

**다 쓴 렌더 타겟은 dispose 대상이다**

렌더 타겟은 GPU 메모리를 직접 잡는 자원이다. 리사이즈 때마다 새로 만들고 이전 것을 버리면 그대로 누수가 된다.

```jsx
renderTarget.dispose();
```
