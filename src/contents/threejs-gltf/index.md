---
title: GLTF
published: true
category: three.js
subtitle: The advantages of glTF as a transmission format, the categories of 3D file formats and Draco and KTX2 compression
date: 2026-08-05
---

## glTF 형식

---

그래픽 요소를 표현하기 위해 설계된 파일 형식이다.

**장점**

1. **전달 시 파일 용량 최적화**
   - vertex 등의 데이터를 바이너리로 저장해서 별도의 파싱 없이 바로 GPU에 올릴 수 있다.
2. **렌더링 최적화**
   - 전부 삼각형으로 변환해서 저장되는 등, 파일 형식 자체가 렌더링에 최적화되게 만들어졌다.

OBJ 같은 텍스트 형식은 `v 1.0 -1.0 0.5` 같은 문자열을 숫자로 파싱하는 과정이 필요하다. 정점이 수십만 개라면 이 파싱만으로 메인 스레드가 멈춘다. glTF는 이미 `Float32Array`로 쓸 수 있는 바이너리 덩어리를 들고 있어서 그대로 넘기면 된다.

"GL Transmission Format"이라는 이름 그대로 **전송을 위한 형식**이고, 3D 분야의 JPEG에 해당한다는 말을 많이 한다.

## 3D 파일 형식의 분류

---

- **3D 에디터 형식**
  - .blend, .max, .md, .ma
  - 제작 툴의 작업 파일. 모디파이어나 히스토리 같은 편집 정보까지 들고 있다.
- **교환 형식**
  - .OBJ, .DAE, .FBX
  - 툴 사이에서 데이터를 주고받기 위한 형식
- **앱 형식**
  - 특정 앱이나 게임 등에서 사용하는 파일 형식
- **전달 형식**
  - glTF가 첫 전달 형식

이 분류가 중요한 이유는 **각 형식이 최적화된 목적이 다르기 때문**이다. 교환 형식은 정보 손실을 줄이는 것이 목적이라 용량이 크고 파싱이 무겁다. 전달 형식은 최종 사용자에게 빠르게 전달하고 즉시 렌더링하는 것이 목적이다.

웹에서는 작업 파일이나 교환 형식을 그대로 올리는 것이 아니라, glTF로 변환해서 배포하는 것이 맞다.

## .gltf와 .glb

---

glTF는 두 가지 형태로 저장된다.

- **.gltf**: JSON 파일 + 별도의 .bin 파일 + 텍스처 이미지들
- **.glb**: 위의 모든 것을 하나의 바이너리 파일로 묶은 것

웹에서는 보통 **.glb를 쓴다.** 요청이 한 번으로 끝나고 경로 문제가 생기지 않기 때문이다. .gltf는 파일이 흩어져 있어서 텍스처 경로가 어긋나는 문제가 OBJ와 똑같이 발생한다.

## 사용법

---

새 떼 모델로 연습했다.

```tsx
import { GLTFLoader, OrbitControls, RoomEnvironment } from 'three/examples/jsm/Addons.js';
```

```tsx
private objRender() {
  const gltfLoader = new GLTFLoader();

  gltfLoader.load('/Birds.gltf', (gltf) => {
    const root = gltf.scene;

    root.traverse((obj) => {
      const mesh = obj as three.Mesh;
      if (!mesh.isMesh) return;

      const mat = mesh.material as three.MeshStandardMaterial;
      mat.roughness = 0.7;
      mat.color.set(0x9aa7b5);
    });

    this.scene.add(root);

    const birds = root.getObjectByName('BirdControl');
    if (birds) {
      this.birdsRoot = birds;
    }
  });
}
```

`gltf.scene`이 실제 모델이고, 그 외에 다른 정보도 함께 들어 있다.

```tsx
gltf.scene      // 모델의 루트 Object3D
gltf.animations // 애니메이션 클립 배열
gltf.cameras    // 파일에 포함된 카메라
```

**OBJ와 달리 계층 구조와 이름이 유지되므로, `getObjectByName`으로 특정 부위를 찾아 따로 제어할 수 있다.** 위 코드에서 `BirdControl`을 찾아 보관해두고, 루프에서 그 자식들만 회전시켰다.

```tsx
private render(time: number) {
  time *= 0.001;

  this.renderer.render(this.scene, this.camera);

  if (this.birdsRoot) {
    for (const bird of this.birdsRoot.children) {
      bird.rotation.z = time;
    }
  }
}
```

부모를 하나 잡아두고 자식을 순회하는 방식이라, 새가 몇 마리인지 코드에서 알 필요가 없다.

## 계층 구조 확인하기

---

`getObjectByName`을 쓰려면 이름을 알아야 하는데, 파일을 열어보지 않고는 알 수 없다. 그래서 트리를 찍어보는 유틸을 만들었다.

```tsx
export function dumpObject(obj, lines = [], isLast = true, prefix = '') {
  const localPrefix = isLast ? '└─' : '├─';

  lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);

  const newPrefix = prefix + (isLast ? '  ' : '│ ');
  const lastNdx = obj.children.length - 1;

  obj.children.forEach((child, ndx) => {
    dumpObject(child, lines, ndx === lastNdx, newPrefix);
  });

  return lines;
}
```

```tsx
console.log(dumpObject(gltf.scene).join('\n'));
```

새 모델을 찍어보면 이렇게 나온다.

```bash
Scene [Group]
 └─BirdControl [Object3D]
   ├─Bird1Rig [Object3D]
   │ ├─Bird1 [SkinnedMesh]
   │ ├─Bone [Bone]
   │ ├─Bone001 [Bone]
   │ ├─Bone002 [Bone]
   │ │ └─Bone003 [Bone]
   │ │   └─Bone004 [Bone]
   │ └─Bone005 [Bone]
   │   └─Bone006 [Bone]
   │     └─Bone007 [Bone]
   ├─Bird2Rig [Object3D]
   │ ├─Bird2 [SkinnedMesh]
   │ └─...
   └─Bird3Rig [Object3D]
     ├─Bird3 [SkinnedMesh]
     └─...
```

여기서 몇 가지가 한 번에 보인다.

- 조작해야 할 대상이 `BirdControl`이라는 것
- 새가 `SkinnedMesh`이고 `Bone` 계층을 가진다는 것. 즉 뼈대 애니메이션이 들어 있는 모델이다
- `traverse`로 재질을 바꿀 때 `isMesh` 검사가 왜 필요한지. 트리의 대부분이 Mesh가 아닌 Bone이다

모델을 불러왔는데 원하는 대로 제어가 안 될 때 가장 먼저 찍어보는 편이 빠르다.

## 애니메이션

---

glTF의 큰 장점이 애니메이션을 그대로 담을 수 있다는 점이다. 파일에 들어 있는 클립을 재생하려면 `AnimationMixer`를 쓴다.

```tsx
const mixer = new three.AnimationMixer(gltf.scene);
const action = mixer.clipAction(gltf.animations[0]);

action.play();

// 루프에서
mixer.update(delta);
```

`mixer.update`를 호출하지 않으면 애니메이션이 첫 프레임에서 멈춰 있다. 모델은 잘 나오는데 움직이지 않는다면 이 부분을 확인한다.

연습에서는 `AnimationMixer` 대신 오브젝트를 직접 회전시켰다. 파일에 담긴 날갯짓 클립을 재생하는 것과, 내가 새 전체를 돌리는 것은 다른 층위의 조작이다. 전자는 파일이 정의한 애니메이션이고 후자는 코드가 만드는 움직임이라, 둘은 동시에 쓸 수 있다.

```tsx
for (const bird of this.birdsRoot.children) {
  bird.rotation.z = time;
}
```

`+=`가 아니라 `=`로 대입한 것이 포인트다. 누적시키면 프레임 간격에 따라 속도가 달라지지만, 경과 시간을 그대로 각도로 넣으면 프레임과 무관하게 일정한 속도가 된다.

## 환경 맵 없이는 PBR 재질이 살지 않는다

---

glTF 모델은 대부분 `MeshStandardMaterial` 계열의 PBR 재질을 쓴다. 그런데 이 재질은 반사할 주변 환경이 없으면 조명을 올려도 밋밋하게 나온다.

HDR 파일을 따로 구하지 않고도 `RoomEnvironment`로 실내 조명 환경을 즉석에서 만들 수 있다.

```tsx
const pmrem = new three.PMREMGenerator(renderer);
this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
```

`PMREMGenerator`는 장면을 재질이 쓸 수 있는 형태의 환경 맵으로 미리 굽는 역할을 한다. 두 번째 인자는 블러 정도이고, 값을 올리면 반사가 더 흐릿해진다.

이걸 넣기 전과 후의 차이가 조명을 하나 더 추가하는 것보다 컸다. 금속성이 있는 재질이라면 특히 그렇다.

## 압축

---

glTF는 압축 확장을 붙일 수 있다. 용량이 큰 모델이라면 효과가 크다.

**Draco**는 지오메트리를 압축한다. 정점 데이터가 크게 줄어들지만, 로드할 때 디코더가 필요하다.

```jsx
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);
```

**KTX2**는 텍스처를 GPU 압축 포맷으로 저장한다. Draco가 전송 용량을 줄이는 것과 달리, KTX2는 **GPU 메모리 사용량 자체를 줄인다**는 점에서 성격이 다르다.

```jsx
const ktx2Loader = new KTX2Loader()
  .setTranscoderPath('/basis/')
  .detectSupport(renderer);

loader.setKTX2Loader(ktx2Loader);
```

일반 JPG나 PNG는 압축을 풀어서 GPU에 올라가기 때문에 파일이 작아도 메모리는 그대로다. KTX2는 압축된 상태로 GPU에 올라간다. 텍스처가 많은 모델에서는 이쪽이 더 중요한 경우가 많다.

## 정리

---

- 웹 배포용은 .glb로 통일한다.
- 계층 구조와 애니메이션이 유지되므로 부위별 제어가 가능하다.
- 애니메이션이 안 움직이면 `mixer.update(delta)`를 확인한다.
- 지오메트리가 크면 Draco, 텍스처가 무거우면 KTX2를 검토한다. 둘은 해결하는 문제가 다르다.
