---
title: geometry
published: true
category: three.js
subtitle: BufferGeometry의 attribute와 segment
date: 2026-07-25
---

## BufferGeometry

---

지오메트리에 대한 Three.js의 클래스다. 형상을 이루는 정점 데이터를 들고 있다.

**attributes**

- **position**: 형상을 정의하는 3차원 정점
- **vertex index**: 삼각형 면 구성을 위한 정점 인덱스
- **normal**: 면에 대한 수직 벡터
- **uv**: 텍스처 매핑을 위한 좌표
- **color**: 정점의 색상

각 attribute는 정점 개수만큼의 항목을 가지는 평행 배열이다. n번째 정점의 위치는 `position`의 n번째, 그 정점의 법선은 `normal`의 n번째에 들어 있다.

`normal`이 왜 필요한지가 처음에 잘 와닿지 않는데, 조명 계산에 쓰인다. 빛이 면에 얼마나 비스듬히 들어오는지를 알아야 밝기를 정할 수 있고, 그 기준이 면의 수직 벡터다. 그래서 normal이 없거나 잘못되어 있으면 조명을 켜도 물체가 이상하게 어둡거나 평평해 보인다.

```jsx
geometry.computeVertexNormals(); // normal이 없을 때 계산해준다
```

## segment

---

geometry의 분할값이다. 하나의 면을 몇 개로 쪼갤지를 정한다.

```jsx
new THREE.PlaneGeometry(10, 10, 1, 1);   // 삼각형 2개
new THREE.PlaneGeometry(10, 10, 50, 50); // 삼각형 5000개
```

분할이 필요한 경우는 크게 두 가지다.

1. 구나 원통처럼 곡면을 더 매끄럽게 표현할 때
2. 정점을 직접 움직여서 지형이나 파도를 만들 때. 정점이 없으면 움직일 것도 없다.

반대로 분할값을 필요 이상으로 올리면 정점 수가 그대로 부하가 된다. 평면에 텍스처만 입힐 거라면 segment는 1이면 충분하다.

## 프리셋 지오메트리

---

자주 쓰는 형상은 Three.js가 클래스로 제공한다.

**기본 도형**

- **BoxGeometry**: 기본 박스
- **PlaneGeometry**: 평면 사각형
- **CircleGeometry**: 평면 원
- **RingGeometry**: 평면 링
- **SphereGeometry**: 구
- **CylinderGeometry**: 원통
- **TorusGeometry**: 도넛
- **ConeGeometry**: 고깔
- **TorusKnotGeometry**: 매듭
- **CapsuleGeometry**: 알약

**부가 도형**

- **ConvexGeometry**: 정점을 이어서 메우고, 최소한의 면적으로 도형을 만든다
- **RoundedBoxGeometry**: 모서리가 둥근 박스
- **TeapotGeometry**: 유타 티팟

**선과 윤곽**

- **WireframeGeometry**: 삼각형 mesh의 outline을 그릴 수 있다
- **EdgesGeometry**: edge만 그릴 수 있다

이 둘은 형상을 새로 만드는 것이 아니라 기존 geometry를 받아서 선 데이터로 변환한다. 그래서 `Mesh`가 아니라 `LineSegments`와 함께 쓴다.

형상이 어떻게 삼각형으로 쪼개졌는지 눈으로 보려고 헬퍼 메서드를 하나 만들어뒀다.

```tsx
private addOutline(geometry: three.BufferGeometry) {
  const matLine = new three.LineBasicMaterial({
    color: 0xffff00,
  });

  const outline = new three.LineSegments(new three.WireframeGeometry(geometry), matLine);

  this.scene.add(outline);
}
```

같은 geometry를 넘겨서 채워진 mesh 위에 선을 겹쳐 그리는 방식이다. segment 값을 바꿔가며 정점이 어떻게 늘어나는지 확인하기에 좋다.

`EdgesGeometry`로 바꾸면 결과가 달라진다.

```tsx
const edges = new three.EdgesGeometry(geometry, 15);
const line = new three.LineSegments(edges, matLine);
```

두 번째 인자는 임계 각도로, 이 각도보다 크게 꺾인 모서리만 그린다. `WireframeGeometry`가 삼각형 분할선까지 전부 그리는 반면 `EdgesGeometry`는 실루엣만 남기기 때문에, 분할 상태를 확인할 때는 전자가, 도면 같은 느낌을 낼 때는 후자가 낫다.

축 방향이 헷갈릴 때는 `AxesHelper`를 같이 띄웠다.

```tsx
private addAxisHelper() {
  const axisHelper = new three.AxesHelper(2);

  axisHelper.material.depthTest = false;
  axisHelper.renderOrder = 2;

  this.scene.add(axisHelper);
}
```

`depthTest`를 끄고 `renderOrder`를 올린 이유는, 그러지 않으면 물체 안에 축이 파묻혀서 보이지 않기 때문이다. 깊이 검사를 건너뛰고 마지막에 그리게 하면 항상 물체 위에 겹쳐 나온다.

**곡선과 경로 기반**

- **TubeGeometry**: curve를 따라서 원통을 만든다
- **ShapeGeometry**: SVG path를 기반으로 평면을 그린다
- **LatheGeometry**: y축 방향으로 선을 회전시켜서 도형을 만든다. 병이나 컵처럼 회전 대칭인 물체에 적합하다
- **ExtrudeGeometry**: ShapeGeometry와 같이 만드는데 두께와 rounded를 줄 수 있다
- **TextGeometry**: 폰트 데이터로부터 3차원 텍스트를 만든다
- **ParametricGeometry**: 수학 공식을 통해서 3차원 도형을 만든다

**다면체**

- **PolyhedronGeometry** (하위에서 상속됨): 구 형태를 디테일하게 만들기 위함
  - IcosahedronGeometry
  - OctahedronGeometry
  - DodecahedronGeometry
  - TetrahedronGeometry

`SphereGeometry`와 다면체 계열의 차이는 정점이 배치되는 방식이다. `SphereGeometry`는 위도와 경도로 나누기 때문에 극점에 정점이 몰리고 적도는 성기다. 반면 `IcosahedronGeometry`에 detail 값을 주면 표면 전체에 정점이 고르게 퍼진다. 구 표면에 무언가를 균등하게 배치하거나 변형을 줄 때는 후자가 유리하다.

```tsx
new three.IcosahedronGeometry(1, 3); // detail을 올릴수록 구에 가까워진다
```

## ParametricGeometry 연습

---

프리셋으로는 만들 수 없는 형상을 수식으로 만들어봤다. `ParametricGeometry`는 0에서 1 사이의 u, v 두 값을 받아 3차원 좌표를 돌려주는 함수를 넘기면, 그 함수를 격자로 훑어서 면을 만들어준다.

```tsx
private async setupModel() {
  this.addAxisHelper();

  function parametricFunction(u: number, v: number, target: three.Vector3) {
    const x = u * 10 - 5;
    const z = v * 10 - 5;
    const y = Math.sin(u * Math.PI * 2) * Math.cos(v * Math.PI * 2) * 2;

    target.set(x, y, z);
  }

  const geometry = new ParametricGeometry(parametricFunction, 32, 32);

  const matFill = new three.MeshBasicMaterial({
    color: 0x515151,
  });

  const mesh = new three.Mesh(geometry, matFill);
  this.scene.add(mesh);
  this.addOutline(geometry);

  this.mesh = mesh;
}
```

u와 v를 각각 -5에서 5로 펼쳐 x, z 평면을 만들고, y를 사인과 코사인의 곱으로 주면 물결치는 지형이 나온다.

`ParametricGeometry`는 코어가 아니라 addon이라 별도로 가져와야 한다.

```tsx
import { ParametricGeometry } from 'three/examples/jsm/Addons.js';
```

여기서 뒤의 두 인자 32, 32가 segment다. 이 값을 8 정도로 낮추면 곡면이 각지게 꺾이는 게 바로 보인다. 수식으로 만드는 형상은 **분할값이 곧 형상의 정확도**라서, 프리셋 도형보다 segment의 영향이 훨씬 크다.

## 정리

---

- geometry는 형상만 담당하고, 색이나 질감은 material이 담당한다.
- attribute는 정점 개수만큼의 평행 배열이고, 조명이 이상하면 normal을 먼저 의심한다.
- segment는 곡면을 매끄럽게 하거나 정점을 변형할 때만 올린다. 그 외에는 부하일 뿐이다.
- 프리셋으로 안 되는 형상은 직접 attribute를 채워서 만들 수 있다. 이 부분은 BufferGeometry 글에서 다룬다.
