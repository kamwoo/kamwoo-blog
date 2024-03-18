---
title: how to use socket.io
published: true
category: network
subtitle: socket.io concept
date: 2024-03-02
---
### **namespace와 event를 분류하는 방법**

> websocket에서 namespace의 용도를 정확하게 명시된 가이드는 없다. 많은 사람이 사용해봤을 때, best practice가 존재한다.

namespace: 네임스페이스를 사용하여 관련 이벤트를 그룹화하고 다른 이벤트와 구분한다. 이벤트 관리가 더 쉬워지고 이름 충돌이 방지된다. event: 보내고 받는 데이터의 명확한 정의를 포함하는 이벤트를 정의한다.

- **namespace의 connection 유지에 따른 분리**
    
    프론트에서 사용하는 `useSocketQuery` 를 사용하면서 컴포넌트가 unmount되었을 때, socket을 disconnect 시키고 있음.
    
    - 구현부
        
        ```tsx
        import { useQuery, useQueryClient, UseQueryOptions, QueryKey } from "@tanstack/react-query";
        import { useEffect, useMemo } from "react";
        import { Socket } from "socket.io-client";
        
        export function useSocketQuery<TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(
          eventName: string,
          socket: Socket,
          options?: UseQueryOptions<TQueryFnData, TError, TData>
        ) {
          const queryClient = useQueryClient();
          const namespace = socket["nsp"];
          const queryKey = useMemo(() => [namespace, eventName], [namespace, eventName]);
        
          useEffect(() => {
            if (eventName === "data") {
              console.log({ connected: socket.connected, eventName, message: "connect" });
            }
            if (socket.disconnected) socket.connect();
            if (socket.hasListeners(eventName)) return;
        
            socket.on(eventName, (data: TData) => {
              queryClient.setQueryData(queryKey, data);
            });
        
            socket.on("connect_error", async (error) => {
              await queryClient.cancelQueries(queryKey, { exact: true });
              await queryClient.prefetchQuery(queryKey, () => {
                throw new Error(`Connection failed: ${error.message}`);
              });
            });
        
            socket.on("disconnect", async (reason) => {
              await queryClient.cancelQueries(queryKey, { exact: true });
              await queryClient.prefetchQuery(queryKey, () => {
                throw new Error(`Disconnection occurred: ${reason}`);
              });
            });
        
            return () => {
              if (eventName === "data") {
                console.log({ connected: socket.connected, eventName, message: "disconnect" });
              }
              socket.off();
              socket.disconnect();
            };
          }, [socket, eventName, queryClient, queryKey]);
        
          return useQuery<TQueryFnData, TError, TData>(queryKey as QueryKey, () => new Promise<TQueryFnData>(() => null), {
            ...options,
            staleTime: Infinity,
          });
        }
        ```
        
    
    불필요한 socket을 on 시키지 않는다는 것이 장점이라고 생각하고, 추가로 서버에서 namespace에 disconnect 이벤트로 불필요한 동작을 중단시킬 수 있다.
    
    예를 들어서 status bar namespace는 어플리케이션이 동작하는 동안에는 계속 connect 해야 하지만, display namespace는 페이지가 unmount 되었다면 connect 할 필요가 없기 때문에 두 namespace는 분리해야한다.
    
- **기능에 따른 namespace 분리 및 목적에 따른 이벤트 구분(제안)**
    
    namespace는 큰 기능에서 세부 기능으로 depth를 가지고, event는 일관된 네이밍 규칙을 가진다.
    
    일관된 event를 가지기 위해서 기능별로 분리되어야하고 따라서 namespace가 depth를 가진다.
    
    경험상으로 join 이벤트를 얘기했을 때, 뭐를 얘기하는지 알아듣지 못했고 어디 명세에 적혀있는지 뒤져봐야 했다. 작은 기능으로 분리된 namespace와 일관된 event가 소통하기 더 쉽다고 생각한다.
    
    현재 사용 방식
    
    |NameSpace|Event|
    |---|---|
    | /status-bar |time|
    |/status-bar|nickname|
    |/display|on: join|
    |/display|emit: update|
    |/mip|data|
    
    변경 후
    
    |NameSpace|Event|
    |---|---|
    |/status-bar/time|data|
    |/status-bar/nickname|data|
    |/display/layout|on: join|
    |/display/layout|emit: update|
    |/display/mip|data|
    
    궁금한 점 🤔
    
    위 방식말고, rest와 같이 namespace로 resource의 위치와 식별자를 명시하고, event를 GET, PUT 등을 사용하는 방식을 고려한 적이 있는지
    

### **얼마나 큰 데이터를 얼마나 되는 빈도로 통신할 지**

- **네트워크 환경**
    
    네트워크 환경이 좋지 않으면 WebSocket에 연결 시간이 느려지거나 연결이 끊기거나 데이터가 손실되는 등의 문제가 발생할 수 있다.
    
    - websocket 메모리 사용량은 연결 수, 초당 메세지 송수신 수에 영향, 구현에 영향을 많이 받는다.
    
    **155바이트 1초에 100개, 15500B/s**
    
    |네트워크 속도|connection 시간|지속 시간|
    |---|---|---|
    |375B/s|16초|1분 25초|
    |500B/s|12초|1분 10초|
    |1250B/s|5초|-|
    |3750B/s|1.5초|-|
    
    이외에 일반적인 1Mbp 이상에서는 connect되는 시간은 ms로 나온다. 지속 시간은 예기치 않게 연결이 종료되어도 socket.io의 ping pong으로 reconnection 된다.
    
    **병목**
    
    |네트워크 속도|28 Mbps|
    |---|---|
    
    <img src="/images/posts/socket-io-use/1.png" />
    
    **현재 앱에서는** **느린 3G(1Mbps ~ 1.4Mbps) 정도만 되어도 connection 지연 시간과 disconnect되는 시간을 크게 고려하지 않아도 될거라고 생각한다.**
    
- **메시지 크기**
    
    socket.io에서는 default 1회 메세지 최대 크기가 1mb로 설정되었있다. 최대 크기를 넘었을 경우에 socket connection을 kill한다.
    

    <div align='center'>
	<video src="/videos/posts/socket-io-use/2.mov" height="240" controls></video>
	</div>
    

    <div align='center'>
	<video src="/videos/posts/socket-io-use/3.mov" height="240" controls></video>
	</div>
    
    server에서 option을 설정을 통해서 늘릴 수 있다.
    
    전송 시간이 너무 길면 hearbeat 때문에 연결이 끊길 수 있기 때문에 pingTimeout을 늘려야 할 수도 있다.
    
    ```tsx
    const io = new Server(httpServer, {
      maxHttpBufferSize: 1e8,
    	pingTimeout: 60000 // ms, default 20000
    });
    ```
    

**그 외**

- 기타 고려할 사항
    
    1. 네트워크 환경이 좋지 않을 때 어떻게 되는지
    2. 얼마나 많은 메세지가 분당 전송되는지
    3. 한번에 얼마나 큰 데이터를 전송할 수 있는지
    4. 얼마나 많은 유저가 동시에 connection하는지
    5. 연결을 설정하는 시간은 어떻게 변하는지
    6. 서버의 메모리 사용량이 어떻게 되는지
- 연결된 클라이언트 수 (plain websocket과 [socket.io](http://socket.io)를 사용할 때 성능 차이들)
    
    테스트 환경: CPU: i3, RAM: 8GB
    
    - new connection 맺는데에 걸리는 시간
        
        <img src="/images/posts/socket-io-use/4.png" />
        
        |connection 수|plain websocket|[socket.io](http://socket.io)|
        |---|---|---|
        |1,000개|170ms|410ms|
        |10,000개|411ms|519ms|
        
    - 서버 메모리 사용량
        
        <img src="/images/posts/socket-io-use/5.png" />
        
        |connection 수|plain websocket|[socket.io](http://socket.io)|
        |---|---|---|
        |1,000개|80MB|200MB|
        |10,000개|400MB|1800MB|
        
        - 단일 연결 메모리 사용량
            - 각 연결에 필요한 메모리 기본 양
            - 애플리케이션이 데이터를 처리하기 전에 버퍼에 보관된 데이터의 양
            - 응용 프로그램 자체에서 할당한 추가 메모리
    - connection후에 메세지를 수신하는데까지 걸리는 시간
        
        <img src="/images/posts/socket-io-use/6.png" />
        
        |connection 수|plain websocket|[socket.io](http://socket.io)|
        |---|---|---|
        |1,000개|73ms|525ms|
        |10,000개|440ms|440ms|
        
    - 최대 connection 수
        
        |plain websocket|[socket.io](http://socket.io)|
        |---|---|
        |컴퓨팅 파워에 따라 굉장히 다르다. 10K ~ 1M|일반적으로 5000 ~ 10000개|
