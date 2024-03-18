---
title: Websocke, HTTP Polling, SSE
published: true
category: network
subtitle: Websocket concept
date: 2023-04-13
---
---

> Client와 Server를 사이에 지속적인 **양방향 통신**이 가능하도록 하는 기술

> ws 프로토콜을 기반으로 클라이언트와 서버 사이에 지속적인 양방향 연결 스트림을 만들어 주는 기술

- **http polling과 비교**
    
    http는 클라이언트-서버 프로토콜로 요청에 대한 응답으로 이루어진다.
    
    http 특징들에는 무상태성과 비연결성 등이 있다. 그중에서 비연결성은 한번 요청과 응답이 이루어졌다면 연결을 유지하지 않는다는 것을 말한다.
    
    http1.0에서는 수많은 요청에 대해서 연결을 유지한다면 리소스 낭비이기 때문에 연결을 끊었다. 이후로 서비스가 고도화되고 연속적으로 많은 요청을 보내게 되는 경우가 많아지면서, 매 요청마다 handshaking을 진행하는 것이 더 비효율적이라고 판단했고 http1.1부터는 지속 연결이라는 것을 추가했다. http2.0까지 해서 지속 연결, 파이프닝, 멀티플렉싱과 같은 기술이 등장했다.
    
    <div align='center'>
	<img src="/images/posts/websocket-verses/1.png" />
	</div>
    
    실시간으로 데이터를 제공하는 기능을 구현하기 위해서 polling방식을 사용했다.
    
    <div align='center'>
	<img src="/images/posts/websocket-verses/2.png" />
	</div>
    
    이 방식으로 제대로 실시간 서비스를 하기 까다롭고, 관리하기 복잡하다는 단점이 있었다.
    
    2008년에 websocket이라는 것이 나왔고, 2010년부터 크롬에서 완전히 지원하게 되었다.
    
    하나의 TCP 연결을 통해서 지속적으로 통신을 할 수 있고 양방향이라는 점에 차이가 있다.
    
    <div align='center'>
	<img src="/images/posts/websocket-verses/3.png" />
	</div>
    
    clinet와 server 둘 중 하나라도 연결을 종료하지 않는한 유지된다.
    
- **SSE와 비교**
    
    **Server Sent Event**
    
    > 지속되는 HTTP 연결을 통해서 서버에서 클라이언트로 이벤트를 수신할 수 있도록 하는 기술
    
    클라이언트에서 데이터를 보낼 필요가 없는 애플리케이션에서 사용된다. 예를 들어 상태 업데이트, 소셜 미디어 뉴스 피드, 푸시 알림 등에 사용된다.
    
    ||websocket|server sent event|
    |---|---|---|
    |통신|양방향|단방향|
    |데이터 형태|binary, UTF-8|binary 데이터 지원 안함, UTF-8|
    |reconnection|없음|자동|
    |connection 제한|없음|브라우저당 6개의 연결 가능|
    |프로토콜|ws|http|
    |기타||라이브러리 많지 않음|
    
    <div align='center'>
	<img src="/images/posts/websocket-verses/4.png" />
	</div>