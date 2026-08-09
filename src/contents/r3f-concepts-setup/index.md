---
title: React Three Fiber Basics
published: true
category: react-three-fiber
subtitle: What a React renderer really is, how JSX tags become three.js instances, and what the Canvas component sets up for you
date: 2026-08-09
---

## React 렌더러라는 말

---

React는 두 층으로 나뉜다.

- **reconciler**: 트리를 diff해서 무엇을 생성하고, 수정하고, 삭제할지 결정한다.
- **host config**: reconciler가 내린 결정을 실제 대상에 반영하는 어댑터다.

React가 "DOM 라이브러리"가 아니라는 말이 여기서 나온다. diff를 계산하는 부분은 대상이 무엇인지 모른다. `react-dom`은 host config가 `document.createElement`와 `appendChild`를 부르고, `react-native`는 네이티브 뷰를 부른다.

R3F는 여기서 three.js를 부르는 host config다. `new THREE.Mesh()`를 호출하고 `parent.add(child)`를 한다. 그래서 R3F는 three.js를 감싼 래퍼 라이브러리가 아니라 **React를 three.js에 연결한 어댑터**다.

## JSX 태그가 클래스가 되는 방식

---

`<mesh />`는 R3F가 미리 만들어둔 컴포넌트가 아니다. 태그 이름의 첫 글자를 대문자로 바꿔서 등록된 클래스 목록에서 찾은 뒤 인스턴스화한다.

```javascript
<mesh />          → new THREE.Mesh()
<boxGeometry />   → new THREE.BoxGeometry()
<ambientLight />  → new THREE.AmbientLight()
```

이 구조 덕분에 three.js가 새 클래스를 추가해도 R3F 업데이트를 기다릴 필요가 없다. three.js 버전만 올리면 그 이름의 태그를 바로 쓸 수 있다.

반대로 말하면 **오타가 나도 컴파일 단계에서 잡히지 않는 경우가 있다.** 존재하지 않는 이름을 쓰면 런타임에 "does not exist in the catalogue" 에러가 난다. TypeScript를 쓰면 `ThreeElements` 타입으로 상당 부분 막을 수 있다.

## "오버헤드가 없다"는 말의 의미

---

R3F 소개에 자주 나오는 문장인데, 처음에는 마케팅 문구처럼 들렸다. 실제 의미는 **React가 관여하는 범위가 씬 그래프의 구성 변경까지**라는 것이다.

상태가 바뀌면 React가 재조정을 돌려서 객체를 추가하거나 속성을 대입한다. 거기까지가 React의 일이다. 그 다음부터는 canvas가 `requestAnimationFrame`으로 자기 루프를 돈다. 매 프레임 그려지는 것은 React의 렌더 주기와 아무 상관이 없다.

그래서 회전하는 큐브를 만들 때 매 프레임 `setState`를 부를 필요가 없다. 그건 초당 60번 재조정을 돌리는 것이고, R3F를 쓰는 의미가 사라진다. 프레임마다 바뀌는 값은 [Hooks and Render Loop](/posts/Hooks%20and%20Render%20Loop)에서 다루는 `useFrame` 안에서 객체를 직접 수정한다.

무엇을 어느 쪽에 둘지는 이렇게 나뉜다.

| React 사이클 | 프레임 사이클 |
| --- | --- |
| 큐브의 개수 | 회전 각도 |
| 색상 팔레트 | 위치 보간 |
| 선택된 오브젝트 id | 카메라 추적 |
| UI 토글 상태 | 파티클 갱신 |

## Canvas가 해주는 일

---

바닐라 three.js로 시작할 때 매번 쓰던 보일러플레이트가 전부 `Canvas` 안에 들어가 있다.

1. canvas DOM element 생성
2. `WebGLRenderer`, `Scene`, `PerspectiveCamera` 구성
3. resize 감지 및 카메라 aspect, renderer size 갱신
4. DPR 설정
5. 렌더 루프 시작
6. `Raycaster` 바인딩
7. 언마운트 시 geometry, material, texture dispose

바닐라로 쓸 때 매번 직접 챙겨야 했던 것들이다. 특히 6번과 7번은 빼먹기 쉬운 부분인데, 마우스 피킹을 붙이려면 정규화 좌표를 계산해서 `Raycaster`에 넣는 코드를 직접 짜야 했고, 리소스 해제는 씬을 순회하면서 일일이 `dispose`를 불러야 했다.

7번은 편한 만큼 함정도 있다. **여러 곳에서 공유하는 리소스라면 하나가 언마운트될 때 나머지가 같이 깨진다.** 이 경우 `dispose` prop을 `null`로 주면 자동 해제를 끈다. 자세한 내용은 [JSX Mapping Rules](/posts/JSX%20Mapping%20Rules)에 정리했다.

## 설치와 버전

---

R3F는 React 버전과 짝이 맞아야 한다.

| R3F | React |
| --- | --- |
| v8 | react@18 |
| v9 | react@19 |

버전이 어긋나면 재조정 단계에서 에러가 나거나, 더 나쁘게는 조용히 동작하지 않는다. React 19를 쓰면서 R3F v8을 설치하는 실수가 흔하다.

```bash
npm install three @react-three/fiber
npm install -D @types/three
```

여기에 헬퍼 모음인 drei를 거의 같이 쓴다.

```bash
npm install @react-three/drei
```

연습 프로젝트는 vite + react 19 + R3F v9 조합으로 잡았다.

```json
{
  "dependencies": {
    "@react-spring/three": "^10.1.2",
    "@react-three/drei": "^10.7.8",
    "@react-three/fiber": "^9.7.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "three": "^0.185.1"
  }
}
```

`@types/three`는 반드시 three와 같은 마이너 버전으로 맞춘다. three.js는 마이너 버전에서도 API가 바뀌는 편이라, 타입 패키지만 뒤처지면 실제로는 있는 속성이 타입 에러로 잡힌다.

진입점은 평범한 React 앱과 다르지 않다.

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`Canvas`는 부모 요소의 크기를 채우는 방식이라, **부모에 높이가 없으면 아무것도 보이지 않는다.** 처음에 화면이 까맣게만 나와서 한참 헤맸던 부분이다.

```css
html,
body {
  margin: 0;
}
```

```tsx
<div style={{ width: '100vw', height: '100vh', background: '#0e1013' }}>
  <Canvas shadows camera={{ position: [5, 4, 6], fov: 50 }}>
    {/* ... */}
  </Canvas>
</div>
```

`shadows`는 `renderer.shadowMap.enabled = true`에 해당하고, `camera` prop은 기본 카메라의 생성 옵션을 덮어쓴다. 기본값은 [First Scene](/posts/First%20Scene)에 정리했다.
