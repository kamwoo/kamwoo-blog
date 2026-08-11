---
title: getting started
published: true
category: three.js
subtitle: WebGPURenderer 기반 App class 보일러플레이트
date: 2026-07-23
---

## 보일러 플레이트

---

Three.js 자체는 객체 지향으로 작성된다. 추후에 R3F(React Three Fiber)를 사용하게 되면 React 방식으로 쓰게 되지만, 지금은 객체 지향으로 연습한다.

R3F는 결국 Three.js 객체를 JSX로 선언하는 래퍼이기 때문에, 밑단의 객체 구조를 모르면 R3F로 넘어가도 결국 같은 지점에서 막힌다. 순서를 이렇게 잡는 편이 낫다고 생각한다.

연습은 `WebGPURenderer`를 쓰는 `three/webgpu` 엔트리로 진행했다.

```tsx
import * as three from 'three/webgpu';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { Inspector } from 'three/examples/jsm/inspector/Inspector.js';
```

## Three.js 구성 요소

---

- **WebGPURenderer**: 장치에 렌더링 해줌
  - **Scene**: 3차원 모델과 빛으로 구성된 장면
    - **Light**: 조명
    - **Mesh**: 3차원 모델
      - **Geometry**: 모델의 형상
      - **Material**: 모델의 색상이나 투명도 등
  - **Camera**: 장면을 어떤 관점으로 볼 것인지를 정의

렌더러가 최상위에 있고, 렌더러는 "어떤 Scene을 어떤 Camera로 그릴지"를 인자로 받는다. 그래서 Scene과 Camera는 형제 관계이지 포함 관계가 아니다.

```tsx
this.renderer.render(this.scene, this.camera);
```

## App 클래스 구조

---

셋업 단계가 여러 개이고 서로 순서 의존이 있어서, 클래스로 묶고 정적 팩토리 메서드로 만들었다.

```tsx
export class App {
  private renderer!: three.WebGPURenderer;
  private domApp!: HTMLElement;
  private scene!: three.Scene;
  private camera!: three.PerspectiveCamera;
  private mesh!: three.Mesh;
  private timer!: three.Timer;
  private orbitControls!: OrbitControls;

  private constructor() {
    console.log('start');
  }

  static async create() {
    const app = new App();

    await app.setupRenderer();
    app.setupCamera();
    app.setupControls();
    app.setupLight();
    app.setupModel();
    app.setupEvent();

    return app;
  }
}
```

생성자를 `private`으로 막고 `static async create()`를 둔 이유는 **초기화에 await가 필요하기 때문**이다. 생성자는 async가 될 수 없는데 `renderer.init()`은 비동기다. 그래서 `new App()`으로는 완성된 인스턴스를 만들 수 없다.

순서에도 의존성이 있다. `setupControls`는 `renderer.domElement`가 필요하므로 `setupRenderer` 뒤여야 하고, `setupCamera`보다도 뒤여야 한다. 팩토리 메서드 안에 순서를 고정해두면 호출하는 쪽에서 실수할 여지가 없다.

사용하는 쪽은 이렇게 끝난다.

```tsx
import './style.css';
import { App } from './app';

await App.create();
```

## WebGPURenderer

---

렌더러를 만들 때 신경 쓴 설정은 톤 매핑과 아웃풋 컬러 스페이스다.

```tsx
async setupRenderer() {
  this.domApp = document.getElementById('app') as HTMLElement;

  if (!this.domApp) {
    console.error('cannot found dom app');
    return;
  }

  const renderer = new three.WebGPURenderer({ antialias: true });

  renderer.toneMapping = three.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputColorSpace = three.SRGBColorSpace;

  renderer.setClearColor(new three.Color('#2c3e50'), 1);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  renderer.inspector = new Inspector();

  this.domApp.appendChild(renderer.domElement);

  await renderer.init();

  this.renderer = renderer;
  this.scene = new three.Scene();
}
```

**`await renderer.init()`이 WebGL과 가장 다른 지점이다.** WebGPU는 어댑터와 디바이스를 요청하는 과정이 비동기라서, 초기화가 끝나기 전에 `render`를 호출하면 아무것도 그려지지 않는다.

`setPixelRatio`에 상한을 두는 이유는 고해상도 기기에서 픽셀 수가 제곱으로 늘어나기 때문이다. devicePixelRatio가 3인 기기에서 그대로 적용하면 그려야 할 픽셀이 9배가 된다. 체감 화질 차이는 크지 않은데 부하만 커지므로 2로 잘랐다.

## 카메라와 조명

---

```tsx
private setupCamera() {
  const width = this.domApp.clientWidth;
  const height = this.domApp.clientHeight;

  this.camera = new three.PerspectiveCamera(60, width / height);
  this.camera.position.set(0, 0, 3);
}

private setupLight() {
  const light = new three.DirectionalLight(0xffffff, 1);
  light.position.set(-1, 2, 4);
  this.scene.add(light);
}
```

`PerspectiveCamera`에 near와 far를 넘기지 않으면 기본값 0.1과 2000이 쓰인다. 연습 단계에서는 그대로 두었지만, 깊이 정밀도 문제가 생기면 조여야 하는 값이다.

## Mesh 만들기

---

```tsx
private setupModel() {
  const geometry = new three.BoxGeometry();
  const material = new three.MeshStandardMaterial();

  const mesh = new three.Mesh(geometry, material);
  this.scene.add(mesh);

  this.mesh = mesh;
}
```

Mesh가 Geometry와 Material로 쪼개져 있는 이유는 둘의 재사용 주기가 다르기 때문이다. 같은 형상에 다른 색을 입히거나, 같은 재질을 여러 형상에 돌려쓰는 일이 흔하다.

```tsx
const geometry = new three.BoxGeometry();
const material = new three.MeshStandardMaterial();

const meshA = new three.Mesh(geometry, material);
const meshB = new three.Mesh(geometry, material); // 같은 자원을 공유한다

meshB.position.x = 2;
this.scene.add(meshA, meshB);
```

이렇게 공유하면 GPU에 올라가는 정점 데이터와 셰이더가 하나씩만 생긴다. 대신 나중에 메모리를 해제할 때 두 번 `dispose`하지 않도록 주의해야 한다.

## 상태값 업데이트

---

- **update**: animation loop에서 돌린다.
- **timer**: rAF 주기는 모니터마다 다르다. 때문에 주기를 맞추기 위해서 timer를 사용한다. 다른 탭에 갔다가 돌아왔을 때 튀는 것도 맞춰준다.

이게 중요한 이유는 프레임마다 고정값을 더하는 코드가 모니터에 따라 다르게 동작하기 때문이다.

```tsx
// 60Hz에서는 초당 60, 144Hz에서는 초당 144만큼 회전한다
this.mesh.rotation.y += 0.01;
```

경과 시간을 기준으로 바꾸면 주사율과 무관하게 같은 속도가 된다.

```tsx
private setupEvent() {
  window.addEventListener('resize', this.resize.bind(this));
  this.resize();

  this.timer = new three.Timer();
  this.timer.connect(document);

  this.renderer.setAnimationLoop(this.render.bind(this));
}

private update() {
  this.timer.update();
  const delta = this.timer.getDelta();

  this.mesh.rotation.y += delta; // 초당 1라디안
}

private render() {
  this.update();
  this.renderer.render(this.scene, this.camera);
}
```

`requestAnimationFrame`을 직접 부르지 않고 `renderer.setAnimationLoop`를 쓴 이유는, WebXR 환경에서 rAF 대신 XR 세션의 프레임 루프를 써야 하는데 렌더러가 이를 알아서 처리해주기 때문이다. 루프를 멈출 때도 `setAnimationLoop(null)` 한 줄이면 된다.

`timer.connect(document)`가 탭 전환 처리를 담당한다. 다른 탭에 갔다가 돌아오면 rAF가 멈춰 있던 시간만큼 delta가 한 번에 몰려서 물체가 순간이동하는데, document의 visibility 이벤트를 듣고 이 값을 잘라준다.

## 화면 제어

---

- **OrbitControls**: camera와 renderer DOM element의 이벤트를 통해서 뷰를 제어한다.

```tsx
private setupControls() {
  this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
}
```

카메라와 DOM element를 둘 다 받는 이유는, 이벤트를 어디서 들을지와 무엇을 움직일지가 분리되어 있기 때문이다. `enableDamping`을 켰다면 관성이 남아 있는 동안 계속 갱신되어야 하므로 루프에서 `controls.update()`를 호출해야 한다.

## GUI

---

- inspector를 renderer에 붙이면 설정 UI를 만들 수 있다.

```tsx
renderer.inspector = new Inspector();

// setupModel 안에서
const gui = (this.renderer.inspector as Inspector).createParameters('설정');
gui.add(mesh, 'visible').name('보이기');
```

값을 코드에서 바꾸고 새로고침하는 것보다 훨씬 빠르게 감을 잡을 수 있다. 조명 세기나 재질의 roughness처럼 숫자만 봐서는 결과를 예측하기 어려운 값들이 특히 그렇다.

## 캔버스 리사이즈

---

캔버스 크기가 바뀌었는데 카메라의 aspect를 갱신하지 않으면 화면이 늘어나 보인다.

```tsx
private resize() {
  const width = this.domApp.clientWidth;
  const height = this.domApp.clientHeight;

  this.camera.aspect = width / height;
  this.camera.updateProjectionMatrix();

  this.renderer.setSize(width, height);
}
```

`updateProjectionMatrix`를 빼먹으면 aspect를 바꿔도 반영되지 않는다. `setupEvent`에서 리스너를 등록한 직후 `resize()`를 한 번 직접 호출하는데, 최초 1회 크기를 맞추기 위해서다. 이걸 빼면 창을 한 번 흔들기 전까지 캔버스가 0 크기로 남는다.
