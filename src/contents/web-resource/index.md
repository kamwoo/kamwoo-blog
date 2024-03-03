---
title: Web Resource
published: true
category: network
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-06-15
---


> HTTP요청 대상을 리소스라고 한다.

URI (Uniform Resource Identifier)

웹에서 리소스에 대한 indentifier와 location은 단인 URL로 제공된다.

URI의 가장 일반적인 형식은 URL이다.

URN은 개별적인 namespace 내에서 이름에 의해 리소스를 식별하는 URI를 말한다.

### URI 구문

<img src="/images/posts/web-resource/1.png" />

스킴 또는 프로토콜

<img src="/images/posts/web-resource/2.png" />

브라우저가 사용해야 하는 프로토콜을 나타낸다. 리소스를 획득하기 위한 방법

#### 종류
|타입|정보|
|---|---|
|data|[데이터 URIs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)|
|file|호스트가 지정하는 파일 이름들|
|ftp|[파일 전송 프로토콜](https://developer.mozilla.org/en-US/docs/Glossary/FTP)|
|http/https|[하이퍼텍스트 전송 프로토콜 (보안)](https://developer.mozilla.org/en-US/docs/Glossary/HTTP)|
|mailto|전자 메일 주소|
|ssh|보안 쉘|
|tel|전화번호|
|urn|Uniform Resource Names|
|view-source| 리소스의 소스 코드|
|ws/wss| (암호화된) [웹소켓](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) 연결 |




도메인 이름, 호스트 명

<img src="/images/posts/web-resource/3.png" />

리소스가 존재하는 호스트의 이름. namespace를 관리하는 도메인 이름 또는 권한으로 어떤 서버가 요청을 받게 될지를 나타낸다.

경로

<img src="/images/posts/web-resource/4.png" />

서버 상의 리소스 경로. 도메인 → 호스트 컴퓨터 → 디렉토리 → 파일명과 같이 계층적으로 리소스의 위치를 나타낼 수 있다. 요즘에는 실제 위치를 사용하지 않고 서버에 의해 다뤄지는 추상화된 경로를 사용한다.

쿼리

<img src="/images/posts/web-resource/5.png" />

서버에 추가적으로 전달되는 파라미터로 응답을 하기전에 추가적인 작업을 하기위해 파라미터 값을 사용한다.

플래그먼트

<img src="/images/posts/web-resource/6.png" />

리소스 자체의 다른 부분, 페이지 내의 다른 부분을 가르키는 앵커이다. “북마크”로 생각할 수 있고, 예를 들어 페이지 내에서 정의된 지점으로 스크롤될 수 있다. 해쉬를 사용하면 서버에 요청이 가지않는다.

### HTTP Request

<img src="/images/posts/web-resource/7.png" />

Request Line

- method
    
    요청된 작업의 종류를 나타낸다.
    
    <img src="/images/posts/web-resource/8.png" />
    
- URI
    
    무엇을 원하는지 나타내는 것으로 위 내용의 경로명? 정도로 생각할 수 있다.
    
- HTTP 버전
    
    버전에 따라 method의 종류가 달라지기 때문에 어떤 버전에 따른 요청인지 나타낸다.
    

Message Header

- Accept
    
    클라이언트가 받을 수 있는 데이터의 종류로 Content-Type 형식으로 표시된다.
    
    Accept 필드를 참조하면 서버는 불필요한 정보를 송신하지 않아도 될 가능성이 생긴다.
    
- Accept-Language
    
    언어의 종류로 영어인지, 한국어인지
    
- User-Agent
    
    브라우저의 종류와 버전
    
- Host
    
    요청을 보낸 곳의 호스트 명과 포트 번호
    

### HTTP Response

<img src="/images/posts/web-resource/9.png" />

status line

HTTP 버전, 상태 코드, 응답 구문으로 나뉜다.

|코드|정보|
|---|---|
|200|OK|
|201|Created|
|302|Found|
|304|Not Modified|
|401|Unauthorized|
|404|Not Found|
|500|Internal Server Error|
|503|Server Unavailable|

200번대: 성공

300번대: 리다이렉션 완료

400번대: 클라이언트 요청 오류

500번대: 서버 오류

- Message Header
    
    응답에 관한 부가적인 정보
    
- Message Body
    
    응답 데이터