---
title: Textures
published: true
category: three.js
subtitle: texture와 GPU 메모리, mipmap 필터링과 wrapping
date: 2026-07-27
---

## texture란

---

Material 규칙에 채워 넣는 **이미지 데이터**다. 실제 나무결 무늬, 벽돌 패턴, 색상 얼룩 같은 픽셀 정보를 말한다.

material이 "빛에 어떻게 반응하는가"라는 규칙이라면, texture는 그 규칙에 들어가는 값이다. 그래서 color 하나만 텍스처로 넣는 것이 아니라 roughness, metalness, normal 같은 값도 전부 텍스처로 줄 수 있다.

## image로 텍스처 넣기

---

Loader의 인스턴스를 생성한 뒤에 load를 통해서 텍스처를 만들고, material 생성 인자로 map에 넣으면 이미지를 텍스처로 넣을 수 있다.

```tsx
private setupModel() {
  const geometry = new three.BoxGeometry();
  const loader = new three.TextureLoader();

  loader.load('/image.png', (texture) => {
    const material = new three.MeshBasicMaterial({
      map: texture,
    });

    const cube = new three.Mesh(geometry, material);
    this.scene.add(cube);
    this.mesh = cube;
  });
}
```

`load`의 두 번째 인자인 콜백 안에서 mesh를 만든 이유는 로딩이 비동기이기 때문이다. `load`는 텍스처 객체를 즉시 돌려주지만 그 시점에는 이미지가 아직 비어 있다.

사실 텍스처만 넣는 경우라면 콜백 없이 반환값을 바로 써도 된다. 이미지가 도착하면 Three.js가 알아서 갱신해주기 때문이다.

```tsx
const texture = loader.load('/image.png');
const material = new three.MeshBasicMaterial({ map: texture });
```

콜백이 필요한 경우는 **이미지의 실제 크기나 비율을 알아야 할 때**, 그리고 로딩이 끝난 시점에 렌더링을 트리거해야 할 때다. 필요할 때만 렌더링하는 구조에서는 콜백에서 `render`를 불러주지 않으면 텍스처가 화면에 나타나지 않는다.

```tsx
const texture = loader.load('/image.png', this.render.bind(this));
```

색상용 텍스처라면 색공간도 지정한다.

```tsx
texture.colorSpace = three.SRGBColorSpace;
```

`colorSpace`를 지정하는 부분을 빼먹기 쉬운데, 색상으로 쓰이는 텍스처는 sRGB로 지정해야 한다. 지정하지 않으면 색이 전반적으로 밝고 바래 보인다. 반대로 normal map이나 roughness map처럼 색이 아니라 수치로 쓰이는 텍스처는 지정하면 안 된다.

여러 장을 로드할 때는 `LoadingManager`로 진행률을 받을 수 있다.

```jsx
const manager = new THREE.LoadingManager();

manager.onProgress = (url, loaded, total) => {
  console.log(`${loaded} / ${total}`);
};

const loader = new THREE.TextureLoader(manager);
```

## 텍스처와 메모리 관리

---

Three.js가 텍스처를 사용하려면 GPU에 텍스처를 넘겨줘야 하는데, GPU는 일반적으로 압축하지 않은 데이터를 사용한다. 따라서 파일의 해상도를 줄여야 한다.

여기서 자주 오해하는 지점이 있다. JPG는 손실 압축을 사용하고 PNG는 비손실 압축을 사용하는 대신 파일이 더 크지만, **파일 크기는 전송량에만 영향을 준다.** GPU 메모리 사용량은 압축 방식과 무관하게 해상도로 결정된다.

```bash
1024 x 1024 텍스처 = 1,048,576 픽셀 x 4바이트(RGBA) = 약 4MB
```

50KB짜리 JPG여도 해상도가 1024x1024면 GPU에서는 4MB를 차지한다. 밉맵까지 만들면 약 1.33배가 더 붙는다. 그래서 텍스처를 줄이려면 파일을 더 압축하는 것이 아니라 **해상도를 낮춰야** 한다.

GPU 메모리 자체를 줄이려면 KTX2 같은 GPU 압축 포맷을 쓰는 방법이 있다. 압축된 상태 그대로 GPU에 올라가기 때문에 메모리 사용량이 실제로 줄어든다.

## 필터링

---

GPU는 텍스처를 화면에 그릴 때 텍스처의 픽셀과 화면의 픽셀이 1:1로 맞지 않으므로, 필터링을 통해서 각 픽셀의 색상을 결정한다.

**텍스처가 원본보다 크게 보일 때 (magFilter)**

- `THREE.NearestFilter`: 텍스처에서 가장 가까운 픽셀을 고른다
- `THREE.LinearFilter`: 가장 가까운 4개의 픽셀을 골라서 실제 거리에 따라 적절하게 섞는다

도트 그래픽처럼 픽셀이 또렷하게 보여야 하는 경우에는 `NearestFilter`를 쓴다. 기본값인 `LinearFilter`를 쓰면 확대했을 때 뿌옇게 번진다.

**텍스처가 원본보다 작게 보일 때 (minFilter)**

작게 보일 때는 밉맵을 함께 사용할 수 있다. 밉맵은 원본을 절반씩 줄여가며 미리 만들어둔 축소본들이다.

- `THREE.NearestFilter`: 가장 가까운 픽셀을 선택한다
- `THREE.LinearFilter`: 주변의 가까운 픽셀 4개를 골라 섞는다
- `THREE.NearestMipmapNearestFilter`: 적절한 밉을 고른 뒤 밉에서 픽셀 하나를 선택한다
- `THREE.NearestMipmapLinearFilter`: 두 개의 밉을 골라 픽셀을 하나씩 선택한 후, 두 픽셀을 섞는다
- `THREE.LinearMipmapNearestFilter`: 적절한 밉을 고른 뒤 픽셀 4개를 골라 섞는다
- `THREE.LinearMipmapLinearFilter`: 두 개의 밉을 골라 각각 픽셀을 4개씩 선택하고, 선택한 8개의 픽셀을 하나의 픽셀로 혼합한다

당연히 1개의 픽셀만을 처리하는 게 성능에 더 좋다. 저사양 기기를 고려해야 할 때는 덜 섞는 것을 사용한다.

밉맵을 쓰는 이유는 성능만이 아니라 화질 때문이기도 하다. 멀리 있는 바닥 텍스처를 밉맵 없이 그리면 픽셀을 띄엄띄엄 샘플링하게 되어 지글거리는 노이즈가 생긴다. 밉맵은 미리 평균을 내둔 축소본을 쓰기 때문에 이 현상이 사라진다.

```jsx
texture.magFilter = THREE.NearestFilter;
texture.minFilter = THREE.LinearMipmapLinearFilter;
```

비스듬히 누운 바닥이 여전히 흐리다면 이방성 필터링을 올리는 것이 효과가 크다.

```jsx
texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
```

## Repeating, offsetting, rotating, wrapping

---

UV 좌표가 0에서 1 범위를 벗어났을 때 어떻게 처리할지를 정하는 속성이 두 개 있다. `wrapS`는 가로, `wrapT`는 세로다.

- `THREE.ClampToEdgeWrapping`: 텍스처의 가장자리 픽셀을 계속해서 반복한다
- `THREE.RepeatWrapping`: 텍스처 자체를 반복한다
- `THREE.MirroredRepeatWrapping`: 텍스처 자체를 반복하되, 매번 뒤집는다

GUI로 세 방식을 바꿔가며 비교하려고 맵으로 묶어뒀다.

```tsx
const wrapModes = {
  clampToEdgeWrapping: three.ClampToEdgeWrapping,
  repeatWrapping: three.RepeatWrapping,
  mirrorRepeatWrapping: three.MirroredRepeatWrapping,
};

function updateTexture() {
  texture.needsUpdate = true;
}
```

**`wrapS`나 `wrapT`를 런타임에 바꿨다면 `needsUpdate`를 켜야 한다.** 이 값들은 GPU에 텍스처를 올릴 때 함께 설정되는 것이라, 자바스크립트 쪽 값만 바꿔서는 이미 올라간 텍스처에 반영되지 않는다.

```tsx
texture.wrapS = three.RepeatWrapping;
texture.wrapT = three.RepeatWrapping;
texture.repeat.set(4, 4);   // 가로세로 4번씩 반복
texture.offset.set(0.5, 0); // 시작 위치 이동
```

`MirroredRepeatWrapping`은 타일링 이음매를 감출 때 유용하다. 뒤집어서 붙이면 경계에서 픽셀이 이어지므로 반복 패턴이 덜 눈에 띈다.

`offset`을 애니메이션 루프에서 조금씩 움직이면 물이 흐르거나 컨베이어 벨트가 도는 효과를 만들 수 있다. 물체를 움직이는 것이 아니라 텍스처만 흘리는 것이라 비용이 거의 없다.

```jsx
texture.offset.x += 0.1 * delta;
```

## 정리

---

- GPU 메모리는 파일 크기가 아니라 해상도로 결정된다. 용량을 줄이려면 해상도를 낮춘다.
- 색상 텍스처는 `colorSpace`를 sRGB로, 데이터 텍스처는 지정하지 않는다.
- 확대는 `magFilter`, 축소는 `minFilter`다. 도트 느낌이 필요하면 Nearest, 그 외에는 밉맵 계열을 쓴다.
- 텍스처도 `dispose`가 필요한 자원이다. 이 부분은 메모리 해제 글에서 다룬다.
