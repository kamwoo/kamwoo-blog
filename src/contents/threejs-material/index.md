---
title: material
published: true
category: three.js
subtitle: 렌더 대상별 material과 NodeMaterial 상속 구조
date: 2026-07-26
---

## material이란

---

빛을 어떻게 반사하고, 얼마나 반짝이고, 금속인지 아닌지 같은 **물리적 성질의 규칙**을 정의한다.

geometry가 "어떤 모양인가"라면 material은 "그 표면이 빛에 어떻게 반응하는가"다. 그리고 실제 무늬나 색상 이미지는 texture가 담당한다. 규칙은 material, 데이터는 texture로 나뉘어 있다고 보면 된다.

## 렌더링 가능한 객체와 재질

---

Three.js에서 화면에 그려지는 객체는 세 종류이고, 각각 쓸 수 있는 재질이 정해져 있다.

- **points**
  - PointsNodeMaterial: WebGPU 스펙의 제한으로 포인트의 크기를 지정해도 표현되지 않음
  - SpriteNodeMaterial
- **line** (LineSegments, LineLoop)
  - Line…NodeMaterial
- **mesh**: 삼각형으로 구성되는 3차원 도형
  - Mesh…NodeMaterial

포인트 크기 제한은 WebGL 시절부터 있던 문제이기도 하다. 브라우저와 GPU에 따라 `gl_PointSize`를 무시하는 경우가 있어서, 크기가 중요한 파티클은 `Points` 대신 `Sprite`나 인스턴싱된 평면을 쓰는 쪽이 안전하다.

## 상속 구조

---

WebGPU 계열에서는 모든 재질이 `NodeMaterial`을 상속받는다.

**NodeMaterial**

- **PointsNodeMaterial**
- **SpriteNodeMaterial**
- **LineBasicNodeMaterial**
  - LineDashedNodeMaterial
- **MeshBasicNodeMaterial**: 광원의 영향을 받지 않는다.
- **MeshLambertNodeMaterial**: 정점에서만 광원을 계산한다.
- **MeshPhongNodeMaterial**: 픽셀 하나하나 전부 광원을 계산한다.
- **MeshStandardNodeMaterial**: 물리 기반 렌더링을 위한 재질. roughness와 metalness를 사용한다.
  - MeshPhysicalNodeMaterial: clearcoat 속성이 추가되어 코팅의 정도를 설정할 수 있다.
- **MeshNormalNodeMaterial**: 지오메트리의 법선을 보여준다. 픽셀이 바라보는 곳의 재질을 정할 수 있다.
- **MeshToonNodeMaterial**: Phong과 비슷하지만 투톤을 주어서 카툰 느낌이 나게 한다.

`NodeMaterial`은 WebGPURenderer와 함께 도입된 체계로, 셰이더를 문자열이 아니라 노드 그래프로 조립한다. WebGL 전용 렌더러를 쓴다면 이름에서 `Node`를 뺀 `MeshStandardMaterial`, `MeshPhongMaterial` 같은 클래스를 쓰면 되고, 성격은 동일하다.

## 선 재질 연습

---

mesh가 아닌 재질을 써보려고 점선을 그려봤다. geometry를 프리셋 없이 정점 배열로 직접 만들고 `Line`에 물렸다.

```tsx
private setupModel() {
  const positions = [-1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0];

  const geometry = new three.BufferGeometry();
  geometry.setAttribute('position', new three.Float32BufferAttribute(positions, 3));

  const material = new three.LineDashedNodeMaterial({
    color: 0xffff00,
    dashSize: 0.2,
    gapSize: 0.1,
    scale: 2,
  });

  const line = new three.Line(geometry, material);
  line.computeLineDistances();

  this.scene.add(line);
}
```

여기서 걸렸던 부분이 `computeLineDistances()`다. **이걸 호출하지 않으면 점선이 아니라 실선으로 나온다.**

이유는 점선을 그리는 방식에 있다. 셰이더는 각 정점이 선의 시작점에서 얼마나 떨어져 있는지를 알아야 "여기는 칠하고 여기는 비운다"를 판단할 수 있는데, 그 누적 거리가 `lineDistance`라는 별도 attribute에 들어간다. 이 값은 자동으로 계산되지 않아서 직접 채워줘야 한다.

`dashSize`와 `gapSize`는 칠하는 길이와 비우는 길이이고, `scale`은 이 값들에 곱해지는 배율이다. 셋 다 월드 단위라서 물체 크기가 바뀌면 점선 간격도 같이 조정해야 한다.

`Line` 대신 `LineSegments`를 쓰면 정점을 2개씩 끊어 별개의 선분으로 그린다. 위 코드처럼 `Line`을 쓰면 정점이 순서대로 이어진 하나의 선이 된다.

## 조명 계산 방식의 차이

---

Lambert와 Phong의 차이가 곧 성능 차이의 핵심이라 따로 정리해둔다.

| | 계산 위치 | 결과 |
| --- | --- | --- |
| Basic | 계산 안 함 | 조명 무시, 항상 같은 색 |
| Lambert | 정점 | 정점 사이는 보간. 정점이 적으면 뭉개진다 |
| Phong | 픽셀 | 정점 수와 무관하게 매끄럽다. 하이라이트 표현 가능 |

Lambert는 정점 단위로만 계산하고 그 사이는 보간하기 때문에, 큰 평면 하나에 스포트라이트를 비추면 빛이 제대로 보이지 않는다. 정점이 네 귀퉁이에만 있어서 가운데를 비추는 빛이 어느 정점에도 걸리지 않기 때문이다. 이럴 때는 Phong으로 바꾸거나 segment를 올려야 한다.

## metalness와 roughness

---

`MeshStandardMaterial`부터는 물리 기반 렌더링(PBR)을 쓴다. 조절하는 값이 두 개다.

- **metalness**: 금속인지 아닌지. 0은 비금속, 1은 금속이다. 중간값은 물리적으로 의미가 없으므로 보통 0 아니면 1을 쓴다.
- **roughness**: 표면이 거친 정도. 0이면 거울처럼 매끈하고, 1이면 완전히 흩어진다.

```tsx
const material = new three.MeshStandardNodeMaterial({
  color: 0x44aa88,
  metalness: 1,
  roughness: 0.2,
});
```

주의할 점은 **metalness가 1인 재질은 환경 맵이 없으면 거의 검게 보인다**는 것이다. 금속은 스스로 색을 내지 않고 주변을 반사하는 재질이라, 반사할 대상이 없으면 반사할 것도 없다. 조명을 아무리 올려도 해결되지 않고 `scene.environment`를 설정해야 한다.

`MeshPhysicalMaterial`은 여기에 clearcoat, transmission, sheen 같은 속성을 더한다. 자동차 도장처럼 표면 위에 투명한 코팅층이 한 겹 더 있는 재질을 표현할 때 쓴다.

## 성능

---

조명 계산이 정교해질수록 비용이 올라간다.

```bash
MeshBasicMaterial > MeshLambertMaterial > MeshPhongMaterial > MeshStandardMaterial > MeshPhysicalMaterial
```

왼쪽이 가장 빠르다. 그래서 선택 기준은 이렇게 잡는 편이다.

- 조명이 필요 없는 UI 요소, 헬퍼, 배경 → **Basic**
- 조명은 받되 하이라이트가 필요 없고 정점이 충분히 많음 → **Lambert**
- 사실적인 질감이 필요함 → **Standard**
- 코팅, 투과 같은 특수 표현이 필요함 → **Physical**

물체 수가 많을 때는 재질을 공유하는 것도 중요하다. 재질이 다르면 셰이더 프로그램이 따로 컴파일되고 draw call도 나뉜다. 색만 다른 물체가 수백 개라면 재질을 각각 만드는 대신 정점 색상(vertex color)이나 인스턴스 색상을 쓰는 편이 낫다.
