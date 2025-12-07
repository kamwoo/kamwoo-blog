---
title: MIME Type
published: true
category: network
subtitle: MIME Type의 개념과 Content-Type을 통한 파일 형식 식별 방법
date: 2022-06-08
---


>Multipurpose Internet Mail Extensions

직역하면 다목적 인터넷 메일 확장로 다양한 형태의 파일을 전달할 때 파일 변환을 위한 포맷이다.

인코딩된 파일 앞에 데이터의 종류를 설명하는 content-type을 덧붙여 전달한다.

웹에서 파일의 확장자는 의미가 없다. 브라우저는 리소스를 내려받고 MIME Type을 보고 해야될 동작들이 무엇인지 결정할 수 있다.

MIME 타입은 굉장히 많다. 그중에서 text, image, video, audio, application가 있는데
- text는 말 그대로 텍스트 파일. text / css, text / html 등
- image는 image / jpeg, image / png 등
- application은 바이너리 데이터를 의미한다. application / xml,application / json 등

Content-Type은 표준 MIME-Type의 하나다.