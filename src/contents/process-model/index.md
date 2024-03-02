---
title: process model
published: true
category: electron
subtitle: A set of two-state buttons that can be toggled on or off
date: 2024-02-01
---
### main 과 renderer 프로세스

---

Chromium을 사용하고 multi process다. 웹 컨테츠를 보여주는 것 이외에 여러 윈도우를 운영하고 서드파티 extension을 로딩이 필요하기 때문이다.

크롬팀은 탭은 여러개인데 탭 하나의 문제가 전체에 영향을 주지 않기 위해서 각 탭을 프로세스로 사용하였다.

<img src="/images/posts/process-model/process.png" />

electron도 비슷하게 Main과 Renderer 프로세스를 가진다.

각각의 electron 앱은 하나의 main 프로세스를 가지고, 어플리케이션을 동작시킨다. main 프로세스는 node.js로 돌아가고 cjs 문법을 사용한다.

main 프로세스는 BrowserWindow 모듈로 앱의 윈도우를 생성 및 운영하는데에 목적을 가진다.

BrowserWindow 모듈은 EventEmitter로 화면 축소, 확대 등의 이벤트 핸들러를 붙일 수 있다.

또한 BrowserWindow 인스턴스가 종료되면 해당하는 Renderer 프로세스 또한 같이 종료된다.

main 프로세스는 app 모듈을 통해서 electron 앱의 라이프 사이클을 컨트롤 한다.

renderer 프로세스는 BrowserView 모듈과 같은 web embeds로 생성된다.

웹 컨텐츠를 렌더링하는데에 목적을 두고, 웹 표준에 따라 동작한다.

### preload script

---

preload script는 웹 컨텐츠가 로딩되기 전에 renderer 프로세스에서 실행하는 코드가 들어간다.

renderer 컨텍스트에서 돌아가지만 Node.js를 사용할 수 있는 특권이 있다.

renderer와 함께 전역 window 객체를 사용하고 node.js api에 접근할 수 있다. 전역 window 객체로 api를 제공하고 웹 컨텐츠에서 사용할 수 있다.

웹 컨텐츠 코드로 api가 노출되는 것을 피하기 위해서 renderer로부터 preload는 분리된다.

대신에, `contextBridge` 모듈을 사용해서 renderer에서 사용할 수 있다.

```jsx
// preload.js
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('myAPI', {
  desktop: true
})

---
// renderer.js
console.log(window.myAPI) // {desktop: true}
```

`contextBridge` 모듈은

1. renderer에서 main process를 트리거하는데에 사용하는 ipcRenderer를 제공할 수 있다.
2. 원격 URL을 사용하는 electron 껍데기를 만든다고 했을 때, 데스트탑 모드 코드를 사용하기 위해서 window에 커스텀 프로퍼티를 추가할 수 있다.

### utility process

---

Main 프로세스에서 UtilityProccess API를 사용해서 여러 프로세스를 생성할 수 있다.

신뢰할 수 없는 서비스 또는 cpu 집약적인 테스트, 이전에 생성된 프로세스를 죽이는 일등이 있다.

생성된 UtilityProcess는 MessagePorts를 사용하여 renderer 프로세스와 채널을 연결할 수 있다.
