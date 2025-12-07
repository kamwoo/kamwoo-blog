---
title: context isolation
published: true
category: electron
subtitle: Electron context isolation을 통한 보안 강화와 contextBridge를 사용한 안전한 API 노출
date: 2024-02-02
---

context isolation은 preload script와 electron 내부 로직이 분리된 컨텍스트에서 실행되는것을 보장한다.

보안 목적으로 electron 내부 코드와 api가 preload script에 접근하는 것을 예방한다.

**context isolation이 되기 전**

```jsx
// preload.js
window.myAPI = {
  doAThing: () => {}
}
---
// renderer.js
window.myAPI.doAThing()
```

window 객체에 바로 넣기 때문에 위험하다.

**context isolation 적용 후**

```jsx
// preload.js
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('myAPI', {
  doAThing: () => {}
})
---
// renderer.js
window.myAPI.doAThing()
```

contextBridge를 통해서 안전하게 전달한다.

api를 구현할 때, 주의할 점으로 ipc와 같은 api를 그대로 노출하는 것은 사용하기에 위험하다. 예를 들어,

```jsx
contextBridge.exposeInMainWorld('myAPI', {
  send: ipcRenderer.send
})
```

위 코드와 같이 사용한다면 사용처에서 ipc의 send를 필터링 없이 사용가능하게 된다. 따라서 아래와 같이 특정한 이벤트네임으로 동작을 정한다.

```jsx
contextBridge.exposeInMainWorld('myAPI', {
  loadPreferences: () => ipcRenderer.invoke('load-prefs')
})
```