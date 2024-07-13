---
title: Socket.io
published: true
category: network
subtitle: socket.io concept
date: 2024-03-01
---
### socket.io란

> Websocket과 관련한 다양한 기능을 제공하는 라이브러리

### 장단점

**장점**

- Websocket을 사용할 수 없을 때 HTTP polling방식을 사용한다.
    - 초기에 모든 브라우저에서 지원하지 않을 때, 많이 사용했다. 지금은 IE10을 제외하면 모든 브라우저에서 websocket을 지원한다.
- 하트비트 메커니즘으로 주기적으로 연결 상태를 확인하고 끊어지면 자동으로 다시 연결한다.
- 연결이 해제 되었을 때, 패킷이 버퍼링되고 다시 연결되면 재전송한다.
- namespace를 사용하여 multiplexing할 수 있다.
- room에 따라 브로드캐스팅을 할 수 있다.

**단점**

- 패킷에 메타데이터를 추가하기 때문에 socket.io를 사용하는 클라이언트는 일반 websocket 서버와 연결할 수 없다. 클라이언트와 서버 모두 socket.io를 사용해야한다.
- socket.io에서 Protocol upgrade를 하기 전 체크하는 과정으로 인한 delay
- polling으로 인한 memory 사용량 증가
- Memory Leak 이슈 websocket을 열고 닫는데 따른 잔류 메모리 사용
- 서버 과부하로 인해서 연결이 종료되도 polling으로 다시 요청

### [engine.io](http://engine.io)

- server는 [engine.io](http://engine.io), client는 engine.io-client
    
- socket.io는 event 기반 API 제공하고, engine.io는 ****low-level 통신 기능을 담당
    
- 예를 들어 Manager에서 이벤트를 처리하고, [egine.io](http://egine.io) 모듈을 사용해서 통신을 한다.
    
	<img src="/images/posts/socket-io/1.png" />

### client

socket과 Manager 관계를 이해할 필요가 있다.

<div align='center' style={{backgroundColor: "white"}}>
<img src="/images/posts/socket-io/2.png" />
</div>

**io**

> socket 인스턴스를 생성한다. namespace 별로 생성한다.

```jsx
const socket = io("ws://example.com/my-namespace", options)

socket.on('connect', () => {})
```

인자로 전달받은 url을 기반으로 Manager를 생성하거나 기존의 Manager를 재사용할지 결정한다. host가 다르면 다른 Manager를 사용한다.

- options
    
    |option|description|default|
    |---|---|---|
    |forceNew|새로운 Manager 인스턴스를 만들지|false|
    |multiplex|존재하는 Manager 인스턴스를 재사용할지 말지|true|
    |transports|socket.io 서버 연결 방법|["polling", "websocket"]|
    |upgrade|HTTP long polling에서 upgrade할지 말지|true|
    |path|경로|/socket.io/|
    |query|query parameter|-|
    |extraHeaders|추가 header 필드|-|
    |reconnection|재연결 활성화 여부|true|
    |reconnectionAttempts|reconnection 횟수|Infinity|
    |reconnectionDelay|reconnection 지연 시간|1000|
    |timeout|각 연결 시도할 때, 시간 제한, milliseconds|20000|
    |autoConnect|생성 시 자동 연결 여부|true|
    
- 구현 코드
    
    ```tsx
    // lookup이 io
    function lookup(
      uri: string | Partial<ManagerOptions & SocketOptions>,
      opts?: Partial<ManagerOptions & SocketOptions>
    ): Socket {
      if (typeof uri === "object") {
        opts = uri;
        uri = undefined;
      }
    
      opts = opts || {};
    
    	// 1. url parse 
      const parsed = url(uri as string, opts.path || "/socket.io");
      const source = parsed.source;
      const id = parsed.id;
      const path = parsed.path;
      const sameNamespace = cache[id] && path in cache[id]["nsps"];
      const newConnection =
        opts.forceNew ||
        opts["force new connection"] ||
        false === opts.multiplex ||
        sameNamespace;
    
    	// 2. newConnection이 true 이거나 캐싱되어있지 않을 때, Manager 인스턴스인 io를 생성
      let io: Manager;
    
      if (newConnection) {
        debug("ignoring socket cache for %s", source);
        io = new Manager(source, opts);
      } else {
        if (!cache[id]) {
          debug("new io instance for %s", source);
          cache[id] = new Manager(source, opts);
        }
        io = cache[id];
      }
      if (parsed.query && !opts.query) {
        opts.query = parsed.queryKey;
      }
    
      return io.socket(parsed.path, opts);
    }
    ```
    

**Manager**

> 클라이언트와 서버 간의 WebSocket 연결 설정 및 유지 관리를 담당

socket 집합, reconnection, namespace 처리를 담당하는 모듈로서 engin.io를 사용해서 여러 connection을 관리하고 connect와 disconnect 이벤트를 처리한다.

```jsx
const manager = new Manager("<https://example.com>");

const socket = manager.socket("/badge") // badge namespace
```

namespace 별로 io를 사용하는 것과 manager 하나를 사용하는 것과 동작이 동일하다. 매번 같은 option을 준다면 manger를 사용해서 한 곳에서 관리하는 것이 용이할 것이라고 생각함. axios 인스턴스를 재사용하는 것과 같은 방식

**만났던** **이슈들**

- **Managet 하나를 공유하는 socket중 하나의 socket이 연결이 끊어지면 Manager에 연결된 socket 전부 reconnect 되는 문제**
    
    HiDOM2.0에서는 아래의 useSocketQuery 훅을 사용하고 있다.
    
    ```jsx
    // useSocketQuery
    
    useEffect(() => {
        if (socket.disconnected) socket.connect();
    
    		...
    
        return () => {
          socket.disconnect();
        };
      }, [...dependencies]);
    ```
    
    정상적으로 동작을 한다면 하나의 socket만 disconnect 시킨 경우에 다른 socket은 reconnect 되지 않는다.
    
    **원인은** **react18 stric mode에서 useEffect 2번 실행 때문**
    
    아래의 이미지는 `socket.disconnect()`를 실행할 당시 상황으로
    
    정상적인 상황이라면 `connected`가 `true`일 때 diconnect를 시켜야한다.
    
	<img src="/images/posts/socket-io/2-1.png" />
    
    하지만 useEffect가 짧은 시간안에 2번 실행되면서 connect가 되기 전에 disconnect 시키기 때문에 문제가 발생한다.
    
	<img src="/images/posts/socket-io/2-2.png" />
    
    EIO(같은 Manager)에서 발생한 문제는 connection을 끊게 되고 다른 socket들도 다시 reconnection 하게 된다.
    
    방안
    
    - option에 forceNew를 통해서 EngineIO를 따로 두면 서로 영향을 주지 않기 때문에 특정 연결에 문제가 생긴 경우에 다른 연결이 disconnect되지 않게 할 수 있다.
    - 개발 단계에서 소켓이 이상하다 싶으면 production 모드로 한번 실행해보는게 빠르다.

### server

<div align='center' style={{backgroundColor: "white"}}>
<img src="/images/posts/socket-io/3.png" />
</div>

client는 connection에 사용되는 객체를 말한다. namespace에 속하는 여러 socket은 client를 기반으로 통신한다.

**sio**

```python
import socketio

sio = socketio.AsyncServer()

@sio.event(namespace=namespace)
def connect(sid, eviron):
  print('connect', sid)
```

하단의 정의된 함수명이 이벤트명으로 적용된다.

```python
@sio.on(event, namespace=namespace)
async def handler(sid, data):
    await handler()
```

event와 namespace를 지정해서 받을 수 있다.

정리 잘되어있는 **docs**

[https://python-socketio.readthedocs.io/en/latest/server.html](https://python-socketio.readthedocs.io/en/latest/server.html)

**만났던 문제 상황**

- **이벤트를 수신하고 비동기로 while을 돌고 있는 상황에서 종료 시키는 방법이 필요**
    
    terminate event 사용
    
    ```python
    @sio.on(EVENT, namespace= NAMESPACE)
    async def handler(sid):
      handler()
    ```
    
    전역 변수 사용
    
    ```python
    shouldTerminate = False
    
    def change_shouldTerminate(value: bool): # shouldTerminate 변경
      global shouldTerminate
      shouldTerminate = value
    
    def terminate_handler(): # terminate envent handler
      change_shouldTerminate(True)
    
    def handler(): # event handler
      while not shouldTerminate:
        ...
    
      change_shouldTerminate(False)
    ```
    
    terminate event와 같이 별도의 이벤트를 만드는 방법과 하나의 이벤트에서 payload에 type 필드를 추가해서 분기처리하는 방법도 있다.
    

### namespace, room

<div align='center'>
<img src="/images/posts/socket-io/4.png" />
</div>

**namespace**

> 클라이언트와 서버 간의 통신에서 별도의 채널로 분할하는 방법

애플리케이션의 서로 다른 부분을 고유한 통신 채널로 분리할 수 있다. 예를 들어 채팅용 네임스페이스, 알림용 네임스페이스, 데이터 업데이트용 네임스페이스가 있다.

- mutiplexing
    
    멀티플렉싱을 사용함으로써 단일 WebSocket 연결을 통해 여러 네임스페이스에 대한 메시지를 보내고 받을 수 있다. 코드를 더 쉽게 구성할 수 있고, connection을 줄여서 애플리케이션의 성능을 향상시킬 수 고, 여러 연결을 유지 관리하는 리소스를 줄일 수 있다.
    
    서버는 특정 네임스페이스에 연결된 모든 클라이언트에 이벤트를 브로드캐스트하여 클라이언트와 서버 간의 실시간 통신한다.
    

namespace는 이외에도 이벤트를 그룹화하는 역할을 한다.

```python
@sio.on("new", namespace=namespace1)
def handler(sid, data):
	sio.emit("new", namespace=namespace1)

@sio.on("old", namespace=namespace1)
def handler(sid, data):
	sio.emit("old", namespace=namespace1)
```

**room**

> namespace 하위에서 소켓을 그룹화 시킨것, room에 속하는 소켓들에게만 통신을 할 수도 있다. server에서만 적용되는 방식

<div align='center'>
<img src="/images/posts/socket-io/5.png" />
</div>

사용자가 여러명있을 때, 각 사용자의 socket별로 sid가 다르고 특정 사용자를 grouping해서 emit하기 위해서 사용한다.

```python
import socketio

sio = socketio.AsyncServer()

@sio.on(event, namespace=namespace)
def handler(sid, data):
	sio.enter_room(sid, room=data.roomID, namespace=namespace)

@sio.on(event, namespace=namespace)
def broadcast_handler(sid, data):
	sio.emit(event=event, room=roomID, namespace=namespace, data=data)
```

### socket number

fisrt

|Key|Value|
|---|---|
|0|"open"|
|1|"close"|
|2|"ping"|
|3|"pong"|
|4|"message"|
|5|"upgrade"|
|6|"noop"|

second

|Key|Value|
|---|---|
|0|"CONNECT"|
|1|"DISCONNECT"|
|2|"EVENT"|
|3|"ACK"|
|4|"ERROR"|
|5|"BINARY_EVENT"|
|6|"BINARY_ACK"|

ex) 40은 “message” and “CONNECT”
