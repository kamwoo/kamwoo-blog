---
title: BufferGeometry
published: true
category: three.js
subtitle: 병렬 배열로 이루어진 구조와 index로 정점 재사용하기
date: 2026-08-01
---

## 구조

---

positions, normals, colors, uv 데이터의 배열이다. 이들을 모으면 각 꼭지점에 대한 **평행 배열** 형식의 데이터가 된다.

평행 배열이라는 말은, 배열들이 서로 같은 인덱스를 공유한다는 뜻이다. 3번 정점의 정보를 알고 싶으면 각 배열의 3번째 항목을 보면 된다.

```bash
position: [x0,y0,z0, x1,y1,z1, x2,y2,z2, ...]
normal:   [x0,y0,z0, x1,y1,z1, x2,y2,z2, ...]
uv:       [u0,v0,    u1,v1,    u2,v2,    ...]
```

position과 normal은 정점당 3개, uv는 2개씩 들어간다. 이 값을 `itemSize`로 알려준다.

```jsx
const geometry = new THREE.BufferGeometry();

const positions = new Float32Array([
  -1, -1, 0,
   1, -1, 0,
   0,  1, 0,
]);

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.computeVertexNormals();
```

일반 배열이 아니라 `Float32Array` 같은 형식화 배열을 쓰는 이유는, GPU 버퍼로 복사할 때 변환 없이 그대로 넘길 수 있기 때문이다.

## 면은 삼각형으로 만들어진다

---

GPU는 삼각형만 그린다. 사각형도 원도 전부 삼각형으로 쪼개진다.

따라서 정육면체는 면 6개, 면당 삼각형 2개씩 해서 총 36개의 꼭지점을 가진다.

여기서 의문이 생긴다. 정육면체의 꼭짓점은 8개인데 왜 36개가 필요한가.

이유는 **정점이 위치만 들고 있는 것이 아니기 때문**이다. 같은 꼭짓점이라도 어느 면에 속하는지에 따라 normal이 다르다. 정육면체의 한 꼭짓점은 서로 다른 방향을 향하는 세 면에 걸쳐 있으므로, 면마다 별도의 정점이 필요하다. uv도 마찬가지다.

그래서 정점을 공유할 수 있는 조건은 "위치가 같다"가 아니라 **"모든 attribute가 같다"**이다.

## 인덱스로 정점 재사용하기

---

normal과 uv가 같아서 공유가 가능한 경우에는 인덱스를 쓰면 데이터를 줄일 수 있다.

인덱스는 "0번, 1번, 2번 정점으로 삼각형 하나를 만들어라"라고 지시하는 배열이다.

```jsx
// 인덱스 없이: 정점 6개로 사각형
const positions = new Float32Array([
  -1, -1, 0,   1, -1, 0,   1, 1, 0,
  -1, -1, 0,   1,  1, 0,  -1, 1, 0,
]);

// 인덱스 사용: 정점 4개 + 인덱스 6개
const positions = new Float32Array([
  -1, -1, 0,
   1, -1, 0,
   1,  1, 0,
  -1,  1, 0,
]);

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setIndex([0, 1, 2, 0, 2, 3]);
```

평면이나 구처럼 인접한 면들의 normal이 이어지는 형상에서는 절감 효과가 크다. 반대로 정육면체처럼 면마다 normal이 꺾이는 형상에서는 공유할 수 있는 정점이 없어서 이득이 없다.

## 정점 순서와 면의 방향

---

삼각형을 이루는 정점의 나열 순서가 면의 앞뒤를 결정한다. Three.js는 반시계 방향을 앞면으로 본다.

순서를 반대로 넣으면 뒷면이 되고, 기본 설정에서는 뒷면이 컬링되어 보이지 않는다. 분명히 정점을 넣었는데 아무것도 안 보인다면 이 부분을 의심해볼 수 있다.

```jsx
material.side = THREE.DoubleSide; // 양면을 모두 그린다
```

`DoubleSide`는 임시 확인용으로는 편하지만, 그릴 면이 두 배가 되므로 최종적으로는 정점 순서를 바로잡는 쪽이 낫다.

## 값을 나중에 바꿀 때

---

attribute 값을 애니메이션으로 바꾸려면 갱신 플래그를 켜야 한다. 켜지 않으면 GPU 버퍼가 갱신되지 않아서 화면이 그대로다.

```jsx
const position = geometry.attributes.position;

for (let i = 0; i < position.count; i++) {
  position.setZ(i, Math.sin(i + time));
}

position.needsUpdate = true;
```

정점을 매 프레임 바꾼다면 CPU에서 계산해서 올리는 것 자체가 비용이다. 정점 수가 많다면 셰이더에서 처리하는 쪽이 훨씬 빠르다.

또 정점 위치를 바꾼 뒤에는 경계 정보도 다시 계산해야 한다. 그렇지 않으면 카메라 밖으로 나갔다고 판정되어 물체가 갑자기 사라지거나, 피킹이 어긋난다.

```jsx
geometry.computeBoundingSphere();
```
