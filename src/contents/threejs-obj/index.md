---
title: OBJ
published: true
category: three.js
subtitle: Loading OBJ models with OBJLoader and MTLLoader and dealing with scale, axis orientation and texture size
date: 2026-08-04
---

## OBJ 파일

---

계층 구조가 없다. 간단하거나 복잡한 기능이 필요 없을 때 사용한다.

- obj, mtl 파일로 export할 수 있다.

OBJ는 텍스트 기반 형식이라 사람이 열어볼 수 있다는 장점이 있다. 정점 위치는 `v`, uv는 `vt`, 법선은 `vn`, 면은 `f`로 시작하는 줄에 적혀 있다.

```bash
v 1.000000 -1.000000 -1.000000
vt 0.748573 0.750412
vn 0.000000 0.000000 -1.000000
f 5/1/1 1/2/1 4/3/1
```

계층 구조가 없다는 것은 뼈대나 애니메이션, 부모-자식 관계를 담을 수 없다는 뜻이다. 재질 정보도 별도의 mtl 파일로 빠져 있다. 그래서 요즘은 대부분 glTF를 쓰고, OBJ는 단순한 정적 모델을 주고받을 때 정도에 쓰인다.

## 사용법

---

`OBJLoader`, `MTLLoader`를 사용해서 로드한 후에 scene에 추가한다.

1. MTLLoader로 재질 로드
2. mtl을 OBJLoader에 material로 set
3. obj를 scene에 추가

풍차 모델로 연습했다.

```tsx
private objRender() {
  const mtlLoader = new MTLLoader();
  mtlLoader.setResourcePath('/');

  mtlLoader.load('/windmill_001.mtl', (mtl) => {
    mtl.preload();

    const objLoader = new OBJLoader();
    mtl.materials.Material.side = three.DoubleSide;

    objLoader.setMaterials(mtl);

    objLoader.load('/windmill_001.obj', (root) => {
      this.scene.add(root);
      this.render();
    });
  });
}
```

순서가 정해져 있는 이유는 OBJLoader가 obj를 파싱하면서 재질 이름을 만나면 이미 등록된 재질을 찾아 연결하기 때문이다. 재질을 먼저 준비해두지 않으면 기본 흰색 재질이 붙는다.

**`mtl.materials.Material.side = DoubleSide`가 이 모델에서 꼭 필요했던 부분이다.** 풍차 날개처럼 얇은 판으로 만들어진 부위는 두께가 없어서 한쪽 면만 존재한다. 기본 설정에서는 뒷면이 컬링되기 때문에, 날개가 돌아가는 각도에 따라 사라졌다 나타났다 한다.

`materials`의 키인 `Material`은 mtl 파일 안에 정의된 재질 이름이다. 모델마다 다르므로 파일을 열어보거나 로드 후 찍어보고 맞춰야 한다.

```tsx
console.log(Object.keys(mtl.materials));
```

`async/await` 형태로 쓰면 중첩을 줄일 수 있다.

```tsx
const mtlLoader = new MTLLoader();
mtlLoader.setResourcePath('/');

const mtl = await mtlLoader.loadAsync('/windmill_001.mtl');
mtl.preload();
mtl.materials.Material.side = three.DoubleSide;

const objLoader = new OBJLoader();
objLoader.setMaterials(mtl);

const root = await objLoader.loadAsync('/windmill_001.obj');
this.scene.add(root);
```

로드가 끝난 뒤 `this.render()`를 직접 부르는 이유는 이 연습을 필요할 때만 렌더링하는 구조로 만들었기 때문이다. 상시 루프가 없으므로 모델이 도착한 시점에 한 번 그려주지 않으면 화면에 나타나지 않는다.

```tsx
private setUpEvent() {
  window.addEventListener('resize', this.resize.bind(this));
  this.controls.addEventListener('change', this.render.bind(this));

  this.resize();
  this.render();
}
```

## 주의할 점

---

**1. 크기를 알아야 한다**

항상 장면 전체를 감싸도록 카메라를 설정할 수는 없다. 블렌더로 크기를 조절하는 게 이상적인 방법이다.

모델 제작자마다 단위 기준이 달라서, 어떤 모델은 1이 1미터이고 어떤 모델은 1이 1센티미터다. 그래서 불러왔는데 화면에 아무것도 없거나, 반대로 카메라가 모델 내부에 들어가 있는 경우가 생긴다.

미리 조절이 안 된 모델이라면 로드 후 경계 상자를 재서 맞추는 방법이 있다.

```jsx
const box = new THREE.Box3().setFromObject(root);
const size = box.getSize(new THREE.Vector3());
const center = box.getCenter(new THREE.Vector3());

// 최대 변의 길이가 1이 되도록 정규화
const scale = 1 / Math.max(size.x, size.y, size.z);
root.scale.setScalar(scale);

// 원점으로 이동
root.position.sub(center.multiplyScalar(scale));
```

**2. 방향축**

Three.js에서는 보통 y축이 위쪽이다. 하지만 블렌더 같은 툴에서는 결과물이 z축이 위쪽일 수 있다. 이럴 경우에는 export할 때 맞춰서 내보낸다.

<div align='center'>
<img src="/images/posts/threejs-obj/image.png" width="80%" />
</div>

블렌더 내보내기 대화상자의 **Transform 항목에 있는 `+Y Up` 체크박스**가 이 역할을 한다. 켜두면 블렌더의 z-up 좌표계를 y-up으로 변환해서 내보내주므로, 불러온 쪽에서 손댈 것이 없다. 위 스크린샷은 glTF 내보내기 화면인데, OBJ 내보내기에도 Forward와 Up 축을 지정하는 같은 성격의 옵션이 있다.

같은 화면의 Format 드롭다운에서 `glTF Binary (.glb)`와 `glTF Separate (.gltf + .bin + textures)` 중 무엇을 고르는지도 여기서 정해진다. 이 선택의 차이는 GLTF 글에서 따로 정리했다.

내보내기 옵션을 건드릴 수 없는 상황이라면 불러온 뒤 회전시켜서 맞춘다.

```jsx
root.rotation.x = -Math.PI / 2;
```

다만 이렇게 하면 이후의 모든 위치 계산이 회전된 좌표계 위에서 이루어지므로, 가능하면 export 단계에서 잡는 편이 낫다.

**3. 고용량 텍스처**

퀄리티가 떨어지지 않는 선에서 작은 게 좋다.

모델 하나에 4096x4096 텍스처가 여러 장 붙어 있는 경우가 흔한데, 각각 GPU에서 64MB씩 차지한다. 화면에서 작게 보이는 물체라면 1024로만 줄여도 메모리가 16분의 1이 된다.

## 그 외에 자주 겪는 문제

---

**재질이 검게 나온다**

OBJ가 참조하는 텍스처 경로가 실제 파일 위치와 다른 경우가 많다. mtl 파일 안에는 제작자 컴퓨터의 경로가 그대로 적혀 있기도 하다. 로더에 기준 경로를 지정해주면 해결된다. 위 코드에서 `setResourcePath('/')`를 준 것도 이 때문이다.

```tsx
mtlLoader.setResourcePath('/models/textures/'); // 텍스처를 찾을 위치
mtlLoader.setPath('/models/');                  // mtl 파일 자체의 위치
```

두 메서드의 역할이 다르다. `setPath`는 로드할 파일의 기준 경로이고, `setResourcePath`는 그 파일이 **참조하는** 리소스의 기준 경로다. mtl과 텍스처가 다른 폴더에 있으면 둘을 따로 지정해야 한다.

조명이 없어서 검게 나오는 경우도 있다. OBJ의 기본 재질은 `MeshPhongMaterial`이라 조명을 받아야 보인다.

**표면이 각져 보인다**

OBJ에 법선 정보가 없으면 면 단위로 계산되어 각져 보인다. 로드 후 다시 계산하면 부드러워진다.

```jsx
root.traverse((child) => {
  if (child.isMesh) child.geometry.computeVertexNormals();
});
```

**모델 전체를 순회해야 할 때**

OBJLoader는 최상위 `Object3D`를 돌려준다. 개별 mesh에 그림자 설정을 하거나 재질을 바꾸려면 순회해야 한다.

```jsx
root.traverse((child) => {
  if (!child.isMesh) return;

  child.castShadow = true;
  child.receiveShadow = true;
});
```
