---
title: js-routing
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-05-18
---

요청된 url 또는 이벤트를 통해 새로운 페이지로 전환하기 위해서 필요한 데이터를 요청하고, 화면을 전환하는 것

예)

1. 브라우저 주소창에 url을 입력하면 해당 페이지로 이동한다.
2. 링크를 클릭하면 해당 페이지로 이동한다.
3. 브라우저 뒤로 가기, 앞으로 가기 버튼을 클릭하여 history의 뒤 또는 앞으로 이동한다.

페이지를 전환하는 다양한 방식이 있다.

1. Link Tag
    
    전통적인 방식으로 태그를 클릭하면 속성으로 저장된 href값인 리소스가 URL path에 추가되고, 해당하는 url이 서버에 요청한다. 서버는 html로 화면에 필요한 완전한 리소스를 클라이언트에게 response한다.
    
    정적 리소스가 다운로드되고 다시 렌더링하기 때문에 새로고침이 발생되어 사용성이 좋지 않고, 필요없는 부분까지 갱신하므로 비효율적이다. 매번 중복된 HTML, CSS, JS를 다운로드 하므로 속도 저하의 요인이 된다.
    
2. Ajax 방식
    
    Link Tag 방식의 단점을 보완하기 위해 등장한 것으로 비동기적으로 서버와 데이터를 교환한다.
    
    서버로부터 데이터를 응답받고 새로 렌더링하지않고 일부만 갱신할 수 있다.
    
    Link Tag를 클릭하여 href로 서버 요청이 들어갈때 preventDefault로 요청을 막고, 해당하는 url을 사용해 Ajax를 요청한다.
    
    Ajax 요청은 주소창의 url을 변경시키지 않기 때문에 history 관리가 되지않고, SEO 이슈가 있다.
    
3. Hash 방식
    
    URI의 hash 앵커 기능을 사용하는 방식이다. URL이 동일한 상태에서 hash만 변경되면 브라우저는 서버에 요청을 보내지 않는다. hash는 요청하기 위한 것이 아니라 fragment identifier의 고유 기능인 앵커로 페이지 내부에서 이동을 위한 것이기 때문이다.
    
    페이지가 갱신되지은 않지만 논리적 URL이 존재하기 때문에 history관리에 문제가 없다.
    
    단점은 url에 해쉬(#)가 들어간다는 것, 자바스크립를 실행시키지는 않기 때문에 콘텐츠를 수집할 수 없다.
    
    `window.addEventListener('hashchange', render);`
    
    hash의 변경을 감지하고 url의 hash를 취득해 필요한 ajax 요청을 한다.
    
    `window.addEventListener('DOMContentLoaded', render);`
    
4. Pjax 방식
    
    hash 방식에서 SEO 이슈를 보완하기 위해서 pushState, popState 이벤트를 사용하는 방식
    
    pushState는 주소창의 url을 변경하지만 서버로 요청하지 않고 따라서 페이지가 갱신되지 않는다.
    
    페이지마다 고유의 url이 존재하기 때문에 history에도 문제가 없어, SEO에도 문제가 없다.
    
    하지만 새로고침 버튼을 누르면 pjax 방식은 주소창의 url로 서버 요청이 들어간다. 즉, pjax 방식은 ssr방식과 ajax방식이 혼재되어 있는 방식으로 서버의 지원이 필요하다.
    

모든 아키텍처에는 trade-off가 존재하고, SPA가 정답은 아니다. 상황을 고려해서 적절한 방법을 선택하는 것이 중요하다.

- 어떤 resource가 식별하고 싶다 ⇒ path
- 정렬이나 필터링이 들어가면 ⇒ params