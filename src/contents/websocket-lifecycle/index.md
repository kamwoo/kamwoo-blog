---
title: Websocket Life Cycle
published: true
category: network
subtitle: Websocket handshaking
date: 2023-04-14
---


---

<div align='center'>
<img src="/images/posts/websocket-lifecycle/head.png" />
</div>

- 자세한 그림
    
    <div align='center'>
	<img src="/images/posts/websocket-lifecycle/1.png" />
	</div>
    

### 1. HTTP를 사용한 hand shaking를 통해서 연결을 시작한다.

클라이언트에서 먼저 기본적인 HTTP GET 요청을 보내게 된다.

<div align='center'>
<img src="/images/posts/websocket-lifecycle/2.png" />
</div>

올바르지 않은 header일 경우에는 서버에서 400에러를 응답하고 연결을 끝낸다.

올바른 요청일 경우에는 HTTP에서 WebSocket으로 프로토콜을 변경하라는 지시가 담긴 응답을 한다.

Sec-WebSocket-Key와 Sec-WebSocket-Accept를 비교해서 올바르다면 protocol upgrade한다.

<div align='center'>
<img src="/images/posts/websocket-lifecycle/3.png" />
</div>

### 2. Protocol Upgrade

웹 소켓 확장과 서브 프로토콜은 핸드세이크를 하는 동안 헤더를 통해서 협상된다.

WebSocket 라이브러리를 사용하는 경우에는 이 작업이 자동으로 수행된다.

`Sec-WebSocket-Key` : 클라이언트가 WebSocket 업그레이드를 요청할 자격이 있는지 확인하는 데 필요한 정보를 서버에 제공

`Sec-WebSocket-Accept` : 서버가 WebSocket 연결을 시작하려는 경우 서버의 응답 메시지에 포함

socket.io에서 upgrade전에 체크하는 것

- ensure its outgoing buffer is empty
    
    나가는 버퍼가 비어 있는지 확인
    
- put the current transport in read-only mode
    
    현재 전송을 읽기 전용 모드로 설정
    
- try to establish a connection with the other transport
    
    연결 중인 다른 연결과 연결하기 위해서 찾아본다.
    
    - if successful, close the first transport
        
        만약 기존의 연결에 성공했다면, 현재 연결을 닫는다.
        

### 3. 통신

HTTP 요청과 응답할 때 사용한 TCP/IP를 사용하거나 기존의 연결을 통해서 양방향 통신이 일어난다.

<div align='center'>
<img src="/images/posts/websocket-lifecycle/4.png" />
</div>
### 4. Close

manually하게 종료했을 경우 socket.io-client에서 재요청을 하지 않는다.

- client-side: `io client disconnect` , `io server disconnect`
- server-side: `client namespace disconnect` , `server namespace disconnect`

Client

|Reason|Description|
|---|---|
|io server disconnect|서버가 [https://socket.io/docs/v4/server-api/#socketdisconnectclose로](https://socket.io/docs/v4/server-api/#socketdisconnectclose%EB%A1%9C) 연결 해제 했을 때|
|io client disconnect|[https://socket.io/docs/v4/client-api/#socketdisconnect로](https://socket.io/docs/v4/client-api/#socketdisconnect%EB%A1%9C) manually하게 연결 해제 했을 때|
|ping timeout|서버가 pingInterval + pingTimeout 동안 PING을 보내지 않았을 때|
|transport close|네트워크 연결이 끊어졌을 때, 예를 들어서 사용자가 wifi에서 4G로 바꿀 때|
|transport error|네트워크 에러가 발생했을 때, 예를 들어서 HTTP long-polling cycle에서 서버가 죽었을 때|

Server

|Reason|Description|
|---|---|
|server namespace disconnect|[https://socket.io/docs/v4/server-api/#socketdisconnectclose로](https://socket.io/docs/v4/server-api/#socketdisconnectclose%EB%A1%9C) 연결 해제|
|client namespace disconnect|클라이언트에서 manually하게 연결해제 했을 때|
|server shutting down|server shut down|
|ping timeout|클라이언트가 pingTimeout 안에 PONG 패킷을 보내지 않았을 때|
|transport close|네트워크 연결이 끊어졌을 때, 예를 들어서 사용자가 wifi에서 4G로 바꿀 때|
|transport error|네트워크 연결에서 에러가 발생했을 때|
|parse error|클라이언트에서 유효하지 않은 패킷을 전달받았을 때|
|forced close|클라이언트에서 유효하지 않은 패킷을 전달받았을 때|