---
title: Routing
date: 2022-09-19
published: true
category: react
subtitle: 클라이언트 사이드 라우팅의 개념과 react-router-dom을 사용한 다양한 라우팅 관리 방식
---

<div align="center">
  <img src="/images/posts/routing/thumbnail.jpeg" />
</div>

## Routing이란

지정한 경로로 이동하는 것, 프론트엔드의 관점에서 해당하는 경로의 페이지로 이동하는 것을 말한다.
새로운 페이지를 해당하는 URL로 서버에서 가져와서 보여주는 MPA 방식과 달리 SPA 방식은 Javascript로 DOM을 조작해서 페이지를 보여주게 된다.
이런 클라이언트단에서 페이지를 이동하고 URL을 변경시키는 것을 client slide routing이라고 한다.

## react-router-dom

리액트를 사용하면서 routing을 할 때는 react-router-dom을 사용했다.
react-router-dom 이외에도 react-navigation, wouter 등 많은 라이브러리가 존재하지만 그 중에서 가장 잘 알려져있고, 참고할 문서가 많은 react-router-dom을 선택해서 사용했다.

react-router-dom을 사용하다보면 react-router도 있는 것을 알게되는데 둘의 차이점은 [remix-run/react-router](https://github.com/remix-run/react-router/tree/main/packages)에 잘 나와있다.
react-router는 코어로 경로 일치 알고리즘과 hook을 포함한다. react-router-dom은 react-core를 re-export하고 웹 애플리케이션에서 라우팅하기위한 몇 가지 DOM 특정 API를 추가한다.
react-router에서 직접적으로 import하지 말라고 권고하고 있고, 필요한 것들은 react-router-dom에서 가져와 사용한다.

## 다양한 방식

routing을 관리하는 방법들이 있어서 비교해보고자 한다.

**선언 방식**

1. Routes와 Route
2. useRoute

**관리 방식**

1. useNavigate
2. push and pop
3. routing layer
