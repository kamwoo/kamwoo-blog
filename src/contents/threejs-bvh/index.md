---
title: BVH
published: true
category: three.js
subtitle: raycast를 빠르게 만드는 공간 분할 트리
date: 2026-08-10
---

## 삼각형을 전부 도는 raycast

---

Three.js의 기본 `Raycaster`는 mesh의 삼각형을 **하나도 빠짐없이 순회하면서** 광선과의 교차를 검사한다. 삼각형이 수백 개일 때는 문제가 되지 않지만, 수만 개를 넘어가면 그대로 병목이 된다.

포인터 이벤트를 붙였다면 상황은 더 나쁘다. 마우스가 움직이는 동안 매 프레임 이 순회가 돌기 때문이다. 8만 폴리곤 모델 하나에 `onPointerOver`를 붙이는 것만으로 프레임이 무너질 수 있다.

**BVH(Bounding Volume Hierarchy)**는 3D 공간의 객체들을 트리 구조로 감싸서, 이런 교차 검사를 빠르게 만들어 주는 자료구조다. Three.js 생태계에서는 보통 `three-mesh-bvh` 라이브러리를 쓴다.

## 원리

---

삼각형 각각을 감싸는 바운딩 박스를 만들고, 가까운 박스끼리 묶어 더 큰 박스를 만드는 식으로 올라가면서 이진 트리를 구성한다. 잎에는 실제 삼각형이, 위로 갈수록 넓은 영역을 덮는 박스가 놓인다.

레이캐스팅은 이 트리를 위에서부터 탄다.

1. 루트 노드의 박스와 광선이 교차하는지 확인한다
2. 교차하지 않으면 그 아래 **서브트리 전체를 통째로 스킵**한다. 교차하면 자식 노드로 내려간다
3. 잎의 삼각형에 도달했을 때만 정밀한 intersection 검사를 한다

핵심은 2번이다. 광선과 상관없는 영역을 박스 하나로 잘라낼 수 있어서, 전부 순회하는 O(n) 대신 O(log n)에 가까운 비용으로 끝난다. 8만 폴리곤 모델에서 60fps를 유지한 채로 500개의 광선을 쏘는 것도 가능하다.

박스 대 광선 검사는 삼각형 대 광선 검사보다 훨씬 싸기 때문에, 트리를 타느라 늘어난 검사 횟수보다 건너뛴 삼각형에서 아낀 비용이 압도적으로 크다.

## three-mesh-bvh로 직접 세팅

---

Three.js의 프로토타입에 패치를 얹는 방식으로 전역 적용할 수 있다.

```javascript
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import * as THREE from 'three';

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;
```

`acceleratedRaycast`는 geometry에 `boundsTree`가 있으면 그것을 쓰고, 없으면 원래의 raycast로 넘어간다. 그래서 프로토타입만 갈아끼워 두고, 실제로 트리가 필요한 geometry에만 `computeBoundsTree()`를 호출하면 된다.

전역 패치가 부담스럽다면 mesh나 geometry에 개별로 붙일 수도 있다.

```javascript
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh';

geometry.boundsTree = new MeshBVH(geometry);
mesh.raycast = acceleratedRaycast;
```

## drei의 Bvh 컴포넌트

---

React Three Fiber에서는 drei가 `three-mesh-bvh`를 감싼 `Bvh` 컴포넌트를 제공한다. 감싼 하위 트리의 mesh들에 대해 마운트 시점에 트리를 만들고 raycast를 교체해준다.

```jsx
import { Bvh } from '@react-three/drei';

function Scene() {
  return (
    <Bvh firstHitOnly>
      <ComplexModel />
      <AnotherHeavyMesh />
    </Bvh>
  );
}
```

`firstHitOnly`는 광선 원점에서 **가장 가까운 교차점 하나만** 반환하게 한다. 첫 히트를 찾는 순간 탐색을 멈출 수 있어서 더 빠르다. 포인터 인터랙션은 대개 맨 앞의 객체 하나만 필요하므로 켜두는 편이 좋다. 반대로 광선이 통과하는 객체를 전부 알아야 하는 경우라면 꺼야 한다.

## 비용과 주의점

---

공짜는 아니다.

- **빌드 시간**: 트리를 만드는 데 시간이 든다. 무거운 모델이면 로딩 중에 한 번 끊기는 느낌이 날 수 있다. 로딩 단계에서 미리 만들어두는 편이 낫다
- **메모리**: 트리 자체가 메모리를 차지한다
- **정적 geometry 전제**: 정점이 바뀌면 트리는 무효가 된다. 모프 타깃이나 CPU에서 정점을 갱신하는 경우에는 다시 만들어야 한다. 스키닝 애니메이션처럼 GPU에서만 변형이 일어나는 경우는 원본 geometry 기준이라 문제가 없다
- **해제**: geometry를 [dispose](/posts/Disposing%20Memory)할 때 `disposeBoundsTree()`도 같이 불러줘야 한다

즉 **한 번 만들어두고 오래 쓰는 무거운 정적 메쉬**에 가장 잘 맞는다. 매 프레임 geometry가 바뀌는 대상에는 맞지 않는다.

## 적용 시점

---

- 고밀도 메쉬에 `onPointerOver`나 `onClick` 같은 인터랙션을 붙일 때
- 광선을 다수 쏘는 경우. 시야 판정, 충돌 검사, 지형 위에 객체 올리기 등

다만 raycast 최적화의 첫 수단은 아니다. 상호작용이 필요 없는 객체에는 애초에 핸들러를 붙이지 않는 것, 그리고 무거운 모델 대신 단순한 히트박스를 겹쳐 검사하게 만드는 것이 더 싸다. 정밀한 판정이 꼭 필요할 때 BVH를 꺼내는 순서가 맞다.

수천 개 단위의 객체를 훑어야 한다면 GPU 피킹이 또 다른 선택지다. 삼각형 수와 무관하게 일정한 비용이 든다. [picking](/posts/picking)에 원리를 정리해뒀다.
