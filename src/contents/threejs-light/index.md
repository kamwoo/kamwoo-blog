---
title: Three.js Light
published: true
category: three.js
subtitle: Light types from AmbientLight to RectAreaLight and how the number of lights affects performance
date: 2026-07-28
---

## 종류

---

**AmbientLight**

- 자연광
- 방향이라는 개념이 없고 완전 고르게 적용된다.

방향이 없다는 것은 그림자도 음영도 생기지 않는다는 뜻이다. 모든 면에 같은 값을 더하기만 하므로 이것만 쓰면 물체가 실루엣처럼 납작해 보인다. 어두운 부분이 완전히 검게 죽는 것을 막는 보조 용도로 쓰는 편이다.

```jsx
const ambient = new THREE.AmbientLight(0xffffff, 0.3);
```

**HemisphereLight**

- 반구광
- 천장과 바닥의 색을 인자로 받고, 두 색을 혼합한다.
- 주로 풍경에 사용

위에서는 하늘색, 아래에서는 땅색이 들어오는 상황을 흉내 낸다. AmbientLight보다 자연스러운 이유는 면이 위를 보는지 아래를 보는지에 따라 색이 달라지기 때문이다. 야외 장면의 기본 조명으로 적합하다.

```jsx
const hemisphere = new THREE.HemisphereLight(0x88bbff, 0x886644, 0.6);
```

**DirectionalLight**

- 태양광
- target을 설정하고 target으로 빛을 쏜다.
- 주로 태양빛을 표현할 때 사용

거리 감쇠가 없고 모든 광선이 평행하다. 아주 멀리 있는 광원을 근사한 것이라 그렇다. 위치와 target의 **방향만** 의미가 있고 거리는 밝기에 영향을 주지 않는다.

```jsx
const directional = new THREE.DirectionalLight(0xffffff, 1);
directional.position.set(5, 10, 7);
directional.target.position.set(0, 0, 0);

scene.add(directional);
scene.add(directional.target); // target도 scene에 추가해야 반영된다
```

target을 scene에 추가하지 않으면 위치 변경이 반영되지 않는다. target도 `Object3D`라서 월드 행렬이 갱신되어야 하는데, scene 그래프에 없으면 갱신 대상이 아니기 때문이다.

**PointLight**

- 한 점에서 뻗어나가는 광원

전구에 해당한다. 거리에 따라 밝기가 줄어들고, `distance`와 `decay`로 감쇠를 조절한다.

```tsx
private setupLight() {
  const color = 0xffffff;
  const intensity = 150;

  const light = new three.PointLight(color, intensity);
  light.position.set(0, 10, 0);
  this.scene.add(light);

  const helper = new three.PointLightHelper(light);
  this.scene.add(helper);
}
```

여기서 **intensity가 150이라는 게 처음에 이상해 보였다.** DirectionalLight는 1로 충분한데 PointLight는 세 자리 값을 넣어야 비슷한 밝기가 나온다.

이유는 감쇠 때문이다. Three.js가 물리 기반 조명 단위를 쓰면서 PointLight와 SpotLight의 밝기는 거리의 제곱에 반비례해서 줄어든다. 광원이 물체에서 10만큼 떨어져 있으면 밝기가 100분의 1이 되므로, 애초에 큰 값으로 시작해야 한다.

반면 DirectionalLight는 무한히 먼 광원을 근사한 것이라 거리 감쇠 자체가 없다. 그래서 1 근처의 값을 쓴다. 두 조명의 intensity는 **같은 단위가 아니다.**

**SpotLight**

- 원뿔 안에서의 PointLight

`angle`로 원뿔의 각도를, `penumbra`로 가장자리가 흐려지는 정도를 정한다. `penumbra`가 0이면 경계가 칼같이 잘려서 부자연스러우므로 조금 주는 편이 낫다.

```jsx
const spot = new THREE.SpotLight(0xffffff, 100);
spot.angle = Math.PI / 6;
spot.penumbra = 0.3;
spot.distance = 30;
```

**RectAreaLight**

- 사각 형태의 조명
- MeshStandardMaterial과 MeshPhysicalMaterial만 지원한다.
- 형광등이나 천장의 유리를 통과하는 빛을 표현할 때 사용

제약이 두 가지 더 있다. 그림자를 만들지 못하고, 사용하기 전에 별도의 초기화가 필요하다.

```jsx
RectAreaLightUniformsLib.init();

const rectLight = new THREE.RectAreaLight(0xffffff, 5, 4, 2);
rectLight.lookAt(0, 0, 0);
```

## 헬퍼

---

조명은 눈에 보이지 않기 때문에 위치나 방향을 잡을 때 헬퍼를 붙이면 훨씬 편하다.

```jsx
scene.add(new THREE.DirectionalLightHelper(directional));
scene.add(new THREE.SpotLightHelper(spot));
scene.add(new THREE.PointLightHelper(point));
```

조명을 움직였다면 헬퍼도 갱신해야 따라온다.

```tsx
helper.update();
```

## 조명을 확인하기 좋은 장면

---

조명은 비출 대상이 있어야 확인이 된다. 바닥 하나와 성질이 다른 물체 두 개를 놓고 연습했다.

바닥은 넓은 평면을 눕히고 텍스처를 반복시켰다.

```tsx
const planeSize = 40;
const loader = new three.TextureLoader();
const texture = loader.load('/image.png');

texture.wrapS = three.RepeatWrapping;
texture.wrapT = three.RepeatWrapping;
texture.magFilter = three.NearestFilter;
texture.colorSpace = three.SRGBColorSpace;

const repeats = planeSize / 2;
texture.repeat.set(repeats, repeats);

const planeGeo = new three.PlaneGeometry(planeSize, planeSize);
const planeMat = new three.MeshPhongMaterial({
  map: texture,
  side: three.DoubleSide,
});

const mesh = new three.Mesh(planeGeo, planeMat);
mesh.rotation.x = Math.PI * -0.5;

this.scene.add(mesh);
```

`PlaneGeometry`는 xy 평면에 서 있는 상태로 만들어지므로, 바닥으로 쓰려면 x축으로 -90도 눕혀야 한다.

`side: DoubleSide`를 준 이유는 눕힌 평면을 아래에서 봤을 때도 보이게 하기 위해서다. 조명 위치를 이리저리 옮기다 보면 카메라가 바닥 밑으로 내려가는 경우가 있는데, 단면으로 두면 그때 바닥이 사라진다.

위에 올릴 물체는 각진 것과 둥근 것을 하나씩 뒀다.

```tsx
private setCubeMesh() {
  const cubeSize = 4;
  const cubeGeo = new three.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new three.MeshPhongMaterial({ color: '#8AC' });

  const mesh = new three.Mesh(cubeGeo, cubeMat);
  mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  this.scene.add(mesh);
}

private setSphereMesh() {
  const sphereRadius = 3;
  const sphereGeo = new three.SphereGeometry(sphereRadius, 32, 16);
  const sphereMat = new three.MeshPhongMaterial({ color: '#CA8' });

  const mesh = new three.Mesh(sphereGeo, sphereMat);
  mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  this.scene.add(mesh);
}
```

정육면체는 면마다 밝기가 뚝뚝 끊어지고, 구는 표면을 따라 밝기가 연속적으로 변한다. 같은 조명이라도 형상에 따라 결과가 어떻게 달라지는지 한눈에 비교된다. `y` 위치를 각각 크기의 절반, 반지름보다 조금 크게 잡아서 바닥 위에 얹히도록 했다.

카메라와 컨트롤은 장면 높이에 맞춰 올려뒀다.

```tsx
this.camera = new three.PerspectiveCamera(45, width / height, 0.1, 100);
this.camera.position.set(0, 10, 20);

this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
this.orbitControls.target.set(0, 5, 0);
this.orbitControls.update();
```

`target`을 원점이 아니라 (0, 5, 0)으로 올린 이유는 물체들이 바닥 위에 떠 있기 때문이다. 원점을 기준으로 돌리면 회전 중심이 바닥 아래라 시점이 계속 어긋난다. `target`을 바꾼 뒤에는 `update()`를 불러야 반영된다.

## 성능

---

light는 렌더링 속도에 영향을 미친다. 따라서 적은 조명을 사용할수록 성능에 좋다.

이유는 조명이 셰이더에 들어가는 값이기 때문이다. 조명을 추가하면 픽셀마다 계산해야 할 항이 늘어나고, 조명 개수가 바뀌면 셰이더가 새로 컴파일된다. 그래서 조명을 동적으로 추가하거나 제거하면 그 프레임에 눈에 띄는 끊김이 생길 수 있다.

조명을 줄이면서 비슷한 결과를 내는 방법들이 있다.

- **환경 맵 사용**: `scene.environment`에 HDR 환경 맵을 넣으면 조명 없이도 주변광이 들어온다. 사실적인 결과를 내는 데 조명 여러 개보다 효과가 크다.
- **라이트맵 굽기**: 움직이지 않는 물체의 조명 결과를 미리 텍스처로 구워두면 런타임 계산이 사라진다.
- **가짜 그림자**: 어두운 원형 텍스처를 바닥에 깔면 그림자 맵 없이도 물체가 떠 보이지 않게 만들 수 있다.

실무에서는 DirectionalLight 하나로 주광과 그림자를 만들고, 나머지는 환경 맵과 약한 AmbientLight로 채우는 구성이 무난하다.
