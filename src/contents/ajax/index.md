---
title: AJAX
published: true
category: js
subtitle: Asynchronous Javascript And XML
date: 2022-06-17
---

# AJAX

서버와 통신하기 위해 `XMLHttpRequest` 객체를 사용하는 것으로 JSON, XML, HTML, 일반 텍스트 형식 등 다양한 형식으로 주고 받을 수 있다.

특징

- 페이지 새로고침 없이 서버에 요청
- 서버로부터 데이터를 받고 작업을 수행

한계

- 클라이언트 풀링 방식을 사용하므로, 서버 푸시 방식의 실시간 서비스는 만들 수 없다.
- 바이너리 데이터를 통신할 수 없다.
- Ajax 스크립트가 포함된 서버가 아닌 다른 서버로 Ajax 요청을 보낼 수는 없다.
- 클라이언트 pc로 Ajax요청을 보낼 수 없다.

<div align='center'>
<img src="/images/posts/ajax/1.png" />
</div>

2번이 기존 웹 방식에서 추가되는데, 요청 이벤트가 발생하면 핸들러에 의해 자바스크립트가 호출된다.

자바스크립트는 XMLHttpRequest객체를 사용해서 서버로 요청을 보내고 나서, 응답을 기다릴 필요없이 다른 작업을 처리할 수 있다.