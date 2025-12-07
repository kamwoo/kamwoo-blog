---
title: IPC
published: true
category: electron
subtitle: Electron IPC(Inter-process communication)를 사용한 main과 renderer 프로세스 간 통신 방법
date: 2024-02-03
---

>Inter-process communication의 약자로 데스크탑 앱에서 많은 기능을 담당하는 부분이다.

예를 들어서 UI를 통해서 native api를 호출할 수 있다.

- ipcMain과 ipcRenderer 모듈을 사용해서 channels를 통해 메세지를 주고 받을 수 있다.
- 채널은 추상화되어 있고, 양방향이다.

### 단방향 예시

renderer ⇒ main

1. preload에 이벤트 및 콜백 설정, `ipcRenderer.send` 로 이벤트 및 인자 전달
2. main에서 `ipcMain.on` 으로 이벤트 받았을 때, 동작
3. renderer에서 preload에 정의된 함수 실행으로 이벤트 트리거 및 인자 전달

main ⇒ renderer

1. preload에서 `ipcRenderer.on` 으로 이벤트 및 콜백을 인자로 받는 함수 선언
2. preload에서 `ipcRenderer.send` 로 이벤트 및 인자를 받는 함수 선언
3. Main에서 BrowswerWindow 인스턴스를 사용해서 `mainWindow.webContents.send('이벤트명', 인자)` 로 preload에 이벤트 전달
4. renderer에서는 이벤트와 함께 Main에서 발생시킨 이벤트에 동작할 콜백을 전달

renderer ⇒ renderer

- MessagePorts 사용

### 양방향 예시

**invoke 사용 (권장)**

1. preload에 이벤트 및 콜백 설정, `ipcRenderer.invoke` 로 이벤트 및 인자 전달
2. main에서 `ipcMain.handle` 로 이벤트 받았을 때, 동작
3. render에서 preload에 정의된 함수 실행으로 이벤트 트리거 및 인자 전달
4. main handler에서 리턴한 값이 renderer에서 실행한 함수 리턴값으로 전달됨

**event reply 사용**

```jsx
//preload
const { ipcRenderer } = require('electron')

ipcRenderer.on('asynchronous-reply', (_event, arg) => {
  console.log(arg) // prints "pong" in the DevTools console
})
ipcRenderer.send('asynchronous-message', 'ping')

---
// main
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) // prints "ping" in the Node console
  event.reply('asynchronous-reply', 'pong')
})
```