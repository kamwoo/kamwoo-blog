---
title: Three.js Disposing Memory
published: true
category: three.js
subtitle: GPU resources the GC cannot reclaim and releasing geometry, texture and material with dispose
date: 2026-08-08
---

## GC가 해주지 않는 영역

---

Three.js는 자바스크립트와 다르게 할당한 메모리를 알아서 비우지 못한다. 페이지를 전환하는 경우에는 메모리에서 지워지겠지만, 그 밖의 경우에는 개발자에게 달려 있다.

이유는 실제 데이터가 **자바스크립트 힙이 아니라 GPU에 올라가 있기 때문**이다. 자바스크립트 객체는 참조가 끊기면 GC가 회수하지만, 그 객체가 GPU에 만들어둔 버퍼와 텍스처는 GC의 관할이 아니다. `scene.remove(mesh)`를 하고 변수를 null로 만들어도 GPU 메모리는 그대로 남는다.

textures, geometries, materials의 `dispose` 메서드를 호출해 메모리를 해제할 수 있다.

```jsx
scene.remove(mesh);

mesh.geometry.dispose();
mesh.material.dispose();
texture.dispose();
```

`Object3D`와 `Mesh` 자체에는 `dispose`가 없다. GPU 자원을 직접 들고 있는 것은 geometry, material, texture, 그리고 렌더 타겟이기 때문이다.

## 무엇을 해제해야 하는가

---

해제 대상은 크게 네 가지다.

- **geometry**: 정점 버퍼
- **texture**: 이미지 데이터. 대개 가장 큰 비중을 차지한다
- **material**: 컴파일된 셰이더 프로그램
- **render target**: 렌더링 결과를 담는 텍스처

material은 텍스처를 여러 개 참조할 수 있으므로, material을 해제할 때 딸린 텍스처도 함께 봐야 한다.

```jsx
function disposeMaterial(material) {
  for (const key of Object.keys(material)) {
    const value = material[key];

    if (value && value.isTexture) {
      value.dispose();
    }
  }

  material.dispose();
}
```

`map`뿐 아니라 `normalMap`, `roughnessMap`, `aoMap` 등이 전부 텍스처라서, 이름을 하나하나 적기보다 순회하는 편이 안전하다.

## 모델 전체를 해제하기

---

Three.js의 로더는 대부분 최상위 `Object3D`만을 반환한다. 일일이 하위 요소를 뒤져서 해제해야 한다.

```jsx
function disposeObject(root) {
  root.traverse((object) => {
    if (!object.isMesh) return;

    object.geometry.dispose();

    if (Array.isArray(object.material)) {
      object.material.forEach(disposeMaterial);
    } else {
      disposeMaterial(object.material);
    }
  });

  root.removeFromParent();
}
```

material이 배열일 수 있다는 점을 놓치기 쉽다. 면마다 다른 재질을 쓰는 mesh는 `material`이 배열이다.

## 공유 자원 문제

---

여기서 문제가 하나 생긴다. **여러 mesh가 같은 geometry나 material을 공유하고 있으면**, 위 방식은 아직 쓰이고 있는 자원을 해제해버린다.

```jsx
const geometry = new THREE.BoxGeometry(1, 1, 1);

const meshA = new THREE.Mesh(geometry, material);
const meshB = new THREE.Mesh(geometry, material);

// meshA만 지웠는데 meshB의 geometry까지 사라진다
```

해제된 자원을 다시 그리려고 하면 화면에서 물체가 사라지거나 콘솔에 경고가 뜬다.

## 추적하는 방법

---

생성과 동시에 해당 리소스를 전부 받는 객체를 준비한다.

- geometry
- 텍스처
- uniform
- material

참조 횟수를 세어두면 공유 자원 문제까지 함께 해결된다.

```jsx
class ResourceTracker {
  constructor() {
    this.resources = new Set();
  }

  track(resource) {
    if (!resource) return resource;

    // 로더가 돌려준 트리는 하위까지 훑는다
    if (resource.traverse) {
      resource.traverse((node) => {
        if (node.isMesh) {
          this.track(node.geometry);
          this.track(node.material);
        }
      });
    }

    if (resource.dispose) {
      this.resources.add(resource);
    }

    return resource;
  }

  dispose() {
    for (const resource of this.resources) {
      resource.dispose();
    }

    this.resources.clear();
  }
}
```

`Set`을 쓰기 때문에 같은 자원을 여러 번 track해도 한 번만 등록되고, 해제도 한 번만 일어난다.

사용하는 쪽은 생성할 때 감싸주기만 하면 된다.

```jsx
const tracker = new ResourceTracker();
const track = tracker.track.bind(tracker);

const geometry = track(new THREE.BoxGeometry(1, 1, 1));
const texture = track(loader.load('/textures/wall.jpg'));

// 장면을 통째로 정리할 때
tracker.dispose();
```

## 이 방식의 한계

---

3D 엔진에서 자원은 이런 식으로 관리하지는 않는다. 어떤 자원이 올라올지 미리 알고 있어야 한다.

게임 엔진은 씬 단위로 필요한 에셋 목록을 미리 정의해두고, 씬을 로드할 때 통째로 올리고 언로드할 때 통째로 내린다. 런타임에 하나씩 추적하는 방식은 누락이 생기기 쉽고, 추적 코드 자체가 곳곳에 퍼진다.

웹에서도 페이지나 뷰 단위로 자원 그룹을 만들어두고 그룹째 해제하는 편이 관리하기 낫다.

## 확인하는 방법

---

실제로 해제되고 있는지는 렌더러의 통계로 볼 수 있다.

```jsx
console.log(renderer.info.memory);
// { geometries: 12, textures: 5 }
```

장면을 전환하거나 모델을 교체할 때 이 숫자가 계속 늘어나기만 한다면 누수가 있는 것이다. 반복해서 전환해보면서 숫자가 제자리로 돌아오는지 확인하면 된다.

렌더러 자체를 버릴 때는 컨텍스트도 함께 정리한다.

```jsx
renderer.dispose();
renderer.forceContextLoss();
```

React처럼 컴포넌트가 마운트와 언마운트를 반복하는 환경에서는 이 정리를 빼먹으면 WebGL 컨텍스트가 쌓인다. 브라우저는 동시에 유지할 수 있는 컨텍스트 수에 제한이 있어서, 어느 순간부터 가장 오래된 컨텍스트가 강제로 손실되고 화면이 검게 변한다.

## 정리

---

- GPU 자원은 GC 대상이 아니다. `dispose`를 직접 호출해야 한다.
- 해제 대상은 geometry, texture, material, render target이다.
- 로더가 돌려준 트리는 `traverse`로 훑어야 한다.
- 공유 자원이 있으므로 추적기를 두고 참조를 관리하는 편이 안전하다.
- `renderer.info.memory`로 누수 여부를 확인할 수 있다.
