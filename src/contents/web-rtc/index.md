---
title: WebRTC Base
published: true
category: network
subtitle: WebRTC concept
date: 2022-06-17
---

# WebRTC(Real-time communication)

> 서버를 최대한 거치지 않고 P2P(Peer-to-Peer Network)로 브라우저나 단말 간에 데이터를 주고받는 기술의 웹 표준

- 웹에서 실시간 미디어 스트림을 송수신할 수 있는 유일한 표준
- UDP 기반의 스트리밍 기술

## 활용 분야

WebRTC를 이용한 서비스는 크게 1:1, 1:N, N:N 3가지 방식으로 나뉜다.

- 1:1 방식 → 카카오 보이스톡, Azar, ..
    
- 1:N 방식 → 스푼, 웨비나, 라이브 커머스, ..
    
- N:N 방식 → 회의형 서비스 등
    
    <div align='center'>
<img src="/images/posts/web-rtc/webrtc1.png" />
</div>
    

## Frontend Flow

### 기본 개념

1. 네트워킹으로 연결에 필요한 데이터들을 주고 받는다.
2. 데이터를 바탕으로 peer간의 connection을 맺는다.
3. 커넥션이 열리면, `MediaStream` 과 `RTCDataChannel` 을 connection에 연결할 수 있다.
    - 미디어 스트림(MedisStream)으로 음성, 영상, 텍스트 등의 미디어 데이터를 전송하고 받을 수 있다.
    - 데이터 채널(RTCDataChannel)으로 바이너리 데이터를 교환할 수 있다. 파일 또는 메타 데이터 등

### connection(Negotiation) flow

<div align='center'>
<img src="/images/posts/web-rtc/webrtc2.png" />
</div>

WebRTC는 일반적으로 최신 브라우저에서 잘 지원되지만 일부 비호환성이 남아있다. adapter.js 라이브러리는 이러한 비호환성 지원할 수 있다. jquery나 socket.io와 같음

## 설명

- **Signaling**
    
    : 기기 간에 정보를 전송하여 통신 프로토콜, 채널, 미디어 코덱 및 형식, 데이터 전송 방법 및 필요한 라우팅 정보를 결정하는 프로세스로 **사양에 정의되어 있지 않음.**
    
    따라서 개발자가 적절한 네트워킹 기술을 이용해서 데이터를 교환하기 위해 필요한 **정보**를 주고 받아야한다.
    
    ***정보**는 Offer와 Answer를 통해서 교환하는 Session Description를 말한다.
    
    <div align='center'>
	<img src="/images/posts/web-rtc/webrtc3.png" />
	</div>
    
    (HiDOM2.0에서는 Websocket 사용)
    
    이 과정이 끝나면 각 peer에 local과 remote의 description이 저장된다.
    
    - **SDP** (Session Description Protocol)
        
        : 멀티 미디어 컨텐츠의 연결을 설명하기 위한 표준
        
        **Session Description**
        
        - WebRTC 연결 상의 endpoint의 config를 말한다.
            - 미디어의 종류에 대한 정보와 형식
            - 전송 프로토콜
            - endpoint의 ip와 port
            - 등등
        - 한 줄 이상의 UTF-8 텍스트로 구성된다.
        - [https://datatracker.ietf.org/doc/html/rfc8866](https://datatracker.ietf.org/doc/html/rfc8866)
- **ICE** (Interactive Connectivity Establishment)
    
    : 실시간 미디어 통신 기능을 제공하여 브라우저가 peer를 통신을 가능하도록 해주는 프레임워크
    
    Signaling을 통한 미디어에 대한 정부 뿐만 아니라 네트워크 연결에 대한 정보를 교환해야한다.
    
    ICE는 peer 자신의 네트워크 환경에서 생성된 모든 ICE candidate를 수집하고 교환하여, peer간 가장 성공적인 연결 경로를 찾고, 최적의 경로를 설정하도록 해준다.
    
    <div align='center'>
	<img src="/images/posts/web-rtc/webrtc4.png" />
	</div>
    
    - **ICE candidate(후보)**
        
        : peer가 사용가능한 통신 방법을 나타낸다. 일반적으로 UDP가 많이 사용됨으로 UDP 타입의 candidate들은 다음과 같다.
        
        - host candidate
            
            : 공인 IP나 프라이빗 IP가 있어서, 바로 peer간에 직접적인 연결이 가능할 경우
            
        - peer reflexive candidate
            
            : peer간의 Symmetric NAT에서 얻은 IP와 port를 사용할 경우
            
        - server reflexive candidate
            
            : NAT 뒤에 있는 경우에 STUN 서버를 통해 얻은 공인 IP와 port 사용할 경우
            
        - relay candidate
            
            : NAT 뒤에 있는 경우에 TURN 서버를 통해 얻은 공인 IP와 port 사용할 경우
            
    
    ### NAT(Network Address Translation)
    
    Network Address Translation
    
    > 네트워크 주소를 변환해주는 기능
    
	<div align='center'>
	<img src="/images/posts/web-rtc/nat.png" />
	</div>
    
    외부 IP에서 내부 IP를 매칭시켜서 사용하는 개념
    
    - 네트워크 외부로 나가거나 들어오는 요청들이 주소 변환과정을 거치기 때문에 보안적으로 도움이된다.
    - IPv4의 주소가 포화상태로 공인 IP 한 개로 집에서 휴대폰, 노트북 등 여러개의 IP를 사용하여 주소를 절야할 수 있다.
- **STUN** (Session Traversal Utilities for NAT)
    
    : peer가 NAT 뒤에 있는 경우에 사용되며, 피어의 공인 IP 주소와 포트 번호를 알 수 있게 한다.
    
    peer1은 인터넷을 통해서 peer1의 공개 IP와 NAT 뒤에 있는 peer2가 접근가능한지에 대한 요청을 STUN 서버에 보낸다.
    
    <div align='center'>
	<img src="/images/posts/web-rtc/webrtc5.png" />
	</div>
    
- **TURN** (Traversal Using Relays around NAT)
    
    : peer 간의 통신을 중계하는 역할을 수행하며, 네트워크 환경에서 직접적인 연결이 불가능한 경우에 사용되는 릴레이 서버
    
    모든 peer는 TURN 서버로 패킷을 보내고 다시 전달받는다. 오버헤드 때문에 잘안쓰인다.
    
    <div align='center'>
	<img src="/images/posts/web-rtc/webrtc6.png" />
	</div>
    

## API

*실시간 통신으로 노트북에 카메라 또는 마이크로 데이터를 주고 받는 구현도 있지만, 현재 HiDOM2.0에서 일방적으로 비디오 데이터를 받는 예를 들었음

### 예제

nagotiation 과정으로 먼저 콜백들을 설정한다.

1. signal channel 연결
    
    ```tsx
    	
    this.ws = new WebSocket("wss://hidom2-dev.avikus.ai/stream-eo/ws");
    
    this.ws.onerror = () => this.ws.close();
    
    this.ws.onclose = () => this.scheduleRestart(); //다시 연결, 나중에 나옴
    ```
    
2. peer connection 객체 생성
    
    ```tsx
    this.ws.onmessage = (msg: MessageEvent) => {
    		const iceServers = JSON.parse(msg.data);
    		
    		this.pc = new RTCPeerConnection({ iceServers });
    }
    ```
    
    위 `msg`에 ICE Server들에 대한 정보를 받는다.
    
3. remote description 저장
    
    ```tsx
    this.ws.onmessage = (msg) => {
      this.pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.data)));
    }
    ```
    
    상대방의 connection 구성 옵션을 받아서 설정하겠다는 콜백
    
4. remote ice candidate 저장
    
    ```tsx
    this.ws.onmessage = (msg) => {
      this.pc.addIceCandidate(JSON.parse(msg.data));
    }
    ```
    
5. ICE candidate가 생성되면 보냄
    
    ```tsx
    this.pc.onicecandidate = (evt) => {
        if (evt.candidate !== null && evt.candidate.candidate !== ") {
            this.ws.send(JSON.stringify(evt.candidate));
        }
    }
    ```
    
6. 연결 상태 확인을 위한 콜백 설정
    
    ```tsx
    this.pc.oniceconnectionstatechange = () => {
        console.log("peer connection state:", this.pc.iceConnectionState);
    
        switch (this.pc.iceConnectionState) {
    	      case "disconnected":
    	          this.scheduleRestart();
          }
    };
    ```
    
7. 미디어 데이터 스트림 수신 콜백 설정
    
    ```tsx
    this.pc.ontrack = (evt) => {
        console.log("new track " + evt.track.kind);
        document.getElementById("video").srcObject = evt.streams[0];
    };
    ```
    
    track은 미디어 데이터 스트림, 데이터가 들어오면 video 돔 요소로 넣는다. 이러면 이미지 보임
    
8. 통신 방향 설정
    
    ```tsx
    const direction = "recvonly";
    this.pc.addTransceiver("video", { direction });
    ```
    
9. offer 보냄
    
    ```tsx
    this.pc.createOffer()
    	      .then((description) => {
    	          this.pc.setLocalDescription(description);
    	
    	          console.log("sending offer");
    	          this.ws.send(JSON.stringify(description));
    	      });
    ```
    
10. 재시도 함수
```tsx
scheduleRestart() {
	  if (this.terminated) {
	      return;
	  }
	
	  if (this.ws !== null) {
	      this.ws.close();
	      this.ws = null;
	  }
	
	  if (this.pc !== null) {
	      this.pc.close();
	      this.pc = null;
	  }
	
	  this.restartTimeout = window.setTimeout(() => {
	      this.restartTimeout = null;
	      this.start();
	  }, restartPause);
}
```