---
title: Three.js 다중 요소 렌더링 최적화
published: true
category: three.js
subtitle: draw call 오버헤드가 생기는 이유와 geometry 병합, InstancedMesh를 사용한 개선
date: 2026-08-03
---

## draw call이 비용인 이유

---

Mesh를 하나 만들 때마다 하나 이상의 렌더링 요청을 보낸다. 이 요청 하나를 draw call이라고 한다.

물체 1000개를 그린다면 draw call이 1000번 발생한다. 문제는 GPU가 삼각형을 그리는 시간보다 **CPU가 요청을 준비하는 시간**이 더 오래 걸린다는 점이다. 매번 어떤 셰이더를 쓸지, 어떤 버퍼를 바인딩할지 지정하고 상태가 유효한지 검사해야 하기 때문이다.

그래서 삼각형 100만 개짜리 물체 하나보다, 삼각형 100개짜리 물체 1만 개가 더 느린 상황이 흔하다. 정점 수가 아니라 물체 수가 병목이 되는 것이다.

현재 draw call이 몇 번인지는 렌더러에서 확인할 수 있다.

```jsx
renderer.render(scene, camera);
console.log(renderer.info.render.calls);
```

## geometry 합치기

---

Mesh를 하나로 합친다면 오버헤드를 줄일 수 있다.

`BufferGeometryUtils.mergeGeometries`를 쓰면 여러 geometry를 하나로 만들 수 있다. 각 geometry를 원하는 위치로 미리 변환한 뒤 합치는 것이 핵심이다.

```jsx
const geometries = [];

for (let i = 0; i < 1000; i++) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  geometry.translate(
    Math.random() * 100 - 50,
    Math.random() * 100 - 50,
    Math.random() * 100 - 50,
  );

  geometries.push(geometry);
}

const merged = BufferGeometryUtils.mergeGeometries(geometries);
const mesh = new THREE.Mesh(merged, material);

scene.add(mesh); // draw call 1번
```

**한계**

합친 뒤에는 하나의 물체가 되므로, 개별 물체를 따로 움직이거나 숨길 수 없다. 색을 다르게 하려면 정점 색상을 써야 하고, 피킹으로 개별 물체를 구분하는 것도 직접 처리해야 한다.

그래서 지형, 건물, 나무처럼 **한 번 배치하면 움직이지 않는 것**에 적합하다.

## InstancedMesh

---

같은 geometry와 material을 쓰면서 위치만 다른 물체가 많다면 인스턴싱이 더 낫다. 정점 데이터는 한 벌만 GPU에 올리고, 물체별 변환 행렬만 따로 넘긴다.

```jsx
const mesh = new THREE.InstancedMesh(geometry, material, 1000);
const matrix = new THREE.Matrix4();

for (let i = 0; i < 1000; i++) {
  matrix.setPosition(
    Math.random() * 100 - 50,
    Math.random() * 100 - 50,
    Math.random() * 100 - 50,
  );

  mesh.setMatrixAt(i, matrix);
}

mesh.instanceMatrix.needsUpdate = true;
scene.add(mesh);
```

병합과 달리 **개별 인스턴스를 나중에 움직일 수 있다**는 것이 장점이다. 색상도 인스턴스별로 줄 수 있다.

```jsx
mesh.setColorAt(i, new THREE.Color(0xff0000));
mesh.instanceColor.needsUpdate = true;
```

메모리 면에서도 유리하다. 병합은 정점 데이터를 물체 수만큼 복제하지만, 인스턴싱은 원본 한 벌과 행렬 배열만 가진다.

| | geometry 병합 | InstancedMesh |
| --- | --- | --- |
| draw call | 1 | 1 |
| 정점 메모리 | 물체 수만큼 복제 | 원본 1벌 |
| 개별 이동 | 불가능 | 가능 |
| 서로 다른 형상 | 가능 | 불가능 (같은 geometry만) |

형상이 제각각이면 병합, 같은 형상이 반복되면 인스턴싱이라고 보면 된다.

## 그 외에 효과가 큰 것들

---

**재질 공유**

재질이 다르면 draw call이 나뉜다. 색만 다른 물체가 많다면 재질을 각각 만들지 말고 정점 색상이나 인스턴스 색상을 쓴다.

**텍스처 아틀라스**

텍스처가 다르면 역시 draw call이 나뉜다. 여러 텍스처를 한 장에 모으고 uv로 구분하면 하나로 묶을 수 있다.

**프러스텀 컬링**

Three.js는 기본적으로 카메라 밖의 물체를 걸러낸다. 다만 병합이나 인스턴싱을 쓰면 전체가 하나의 물체가 되므로, 일부만 화면에 있어도 전부 그려진다. 장면이 아주 넓다면 영역별로 나눠서 병합하는 편이 낫다.

**LOD**

멀리 있는 물체는 단순한 형상으로 교체한다. `THREE.LOD`에 거리별 mesh를 등록해두면 카메라 거리에 따라 자동으로 바뀐다.

```jsx
const lod = new THREE.LOD();

lod.addLevel(highDetailMesh, 0);
lod.addLevel(midDetailMesh, 50);
lod.addLevel(lowDetailMesh, 200);
```

## 정리

---

- 병목은 대개 정점 수가 아니라 draw call 수다. `renderer.info.render.calls`로 먼저 확인한다.
- 움직이지 않는 서로 다른 형상 → geometry 병합
- 같은 형상이 반복되고 개별 제어가 필요 → InstancedMesh
- 재질과 텍스처를 통일하는 것만으로도 draw call이 크게 줄어드는 경우가 많다.
