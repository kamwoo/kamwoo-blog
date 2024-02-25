---
title: 프론트엔드 성능 개선
date: 2022-09-25
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
---

<div align="center">
  <img src="/images/posts/performance-improvement/speed.png" />
</div>

현재 진행하고 있는 체크메이트 프로젝트에서 성능을 개선한다는 목표로 작업을 시작했다.<br />
시작하기 전 프론트엔드에서 성능을 개선한다는 것은 무엇을 말하는지 그리고 개선해야 하는 이유를 짚어 봤다.

<br />

> 성능이 곧 사용자 경험이다.

프론트엔드 개발자는 웹 어플리케이션에서 사용자가 실제로 보고 상호작용하는 부분을 만든다.
프론트엔드에서 개선할 수 있는 성능은 사용자에게 빠르게 보여주고 상호작용에 대해서 UI적으로 빠른 응답을 제공하는 것이다.
따라서 로딩과 렌더링 속도를 개선한다면 성능을 개선했다고 말할 수 있겠다.

다음으로 성능을 개선해야 하는 이유는 무엇일까.<br />
첫 번째로 **사용자는 빠른 로딩과 렌더링을 기대한다는 점**이다. 나 역시도 사이트에 접속했을 때 화면이 바로 딱! 뜨는 것이 당연하게 여기고 있었다.
이제는 너무 당연하게 여겨서 살짝 느린 것 같으면 뭐가 잘못됬다는 느낌 마저도 받은 적이 있다. 나에게만 국한되는 얘기가 아니라
소비자 연구에 속도가 느린 사이트를 사용하는 것이 공포 영화를 보는 것과 비슷한 스트레스를 받는다는 결과가 있다.

따라서 성능을 높인다면 더 많은 사용자를 만족시킬 수 있고 이는 수익과 연관된다.
하나의 예로 Pinterest는 로딩 성능 개선 작업을 통해서 Engagement(브랜드 강화)를 60% 향상시켰고, 광고 CTR(클릭률)을 50% 증가시켰다.

두 번째로 **사용자 모두가 같은 환경이 아니라는 점**이다. '이 정도 이유를 찾았으면 됐다!'하고 작업을 시작하려고 보니 내가 보기엔 이미 빠르다고 느꼈다.
접속하면 바로 딱! 보였기 때문이다. '성능 개선 안해도 되겠는데?'라는 생각이 들었다가 다시 보니 환경이 너무 좋다는 것을 알게 되었다.
맥북 M1에 빵빵한 와이파이 밑에서 접속하면 왠만하면 다 빠르다. 하지만 성능이 떨어지는 기기나 인터넷 속도가 느린 환경이라면 말이 다르다. 간단히 확인해보기 위해서 개발자 도구의
느린 3G 환경에서 다시 접속해보니 20초가 걸렸다.

느린 기기와 인터넷 환경, 저사양/구버전의 브라우저에서 사용성을 높이기 위해서는 할 수 있는 최대한 성능을 개선하는 것이 좋다!라는 결론을 내렸다.

### 성능 측정

먼저, 체크메이트 웹 어플리케이션의 성능을 측정했다.

**성능을 측정한 환경은 다음과 같다.**

1. 브라우저: 크롬
2. 기기 환경: 모바일<br />
   출결 관리 서비스로 모바일에서 많이 사용할 것으로 예상
3. 인터넷 환경: LTE, 빠른 3G, 느린 3G
   | 3G | 3% |
   | --- | --- |
   | 4G, LTE | 62% |
   | 5G | 30% |

   무선통신서비스 가입 현황 **[출처: 과학기술정보통신부]**

**측정 도구**

- Lighthouse: Web Vitals에서 핵심 성능 지표 분석 제공
- Chrome Dev Tools Performance
- [WebPageTest](https://www.webpagetest.org/)

**성능 관리 대상 설정**

- 기능적으로 가장 핵심이 되는 요구사항은 무엇인지
- 서비스 특성상 어떤 환경에서의 사용자 경험이 더 중요한지

한번에 모든 성능을 측정하고 개선하기 보다는 우선순위를 정해서 순차적으로 진행하도록 했다. 성능을 측정할 페이지 또는 기능에 대해서 위와 같은 조건을 기준으로 순위를 결정했다.

1. 로그인 페이지: 처음 사용하는 유저와 같이 로그인이 필요한 사용자일 경우 가장 먼저 보게될 페이지이기 때문에 첫 번째 관리 대상을 선정했다.
2. 미팅 페이지: 로그인 페이지 이후로 보게될 페이지일 뿐만 아니라 이전에 로그인한 유저는 자동 로그인이 되기 때문에 해당 사용자에게는 가장 먼저 보여질 페이지이기 때문에 우선순위를 높게 설정했다.

### 측정 결과

- Lighthouse 로그인 페이지
  <img src="/images/posts/performance-improvement/login.png" />
- Lighthouse 미팅 목록 페이지
  <img src="/images/posts/performance-improvement/meetinglist.png" />
- WebPageTest [결과](https://www.webpagetest.org/result/220912_AiDc4B_5J2/)
  <img src="/images/posts/performance-improvement/webpagetest.png" />
- 렌더링 성능
  <img src="/images/posts/performance-improvement/rerender.png" />
- Layout Shift
  <img src="/images/posts/performance-improvement/layout-shift.png" />

### 결과 분석

Google에서 품질을 분석하기 위한 객관적인 지표가 있다.

[Web Vitals](https://web.dev/vitals/)

- LCP: Largest Contentful Print, 주요 컨텐츠가 로드되는 때까지 걸리는 시간
- FID: First Input Delay, 사용자의 이벤트를 감지해서 처리하는 때까지 걸리는 시간
- CLS: Cumulative Layout Shift, 레이아웃 변화량
- DCL: js로 DOM 컨트롤을 시작할 수 있는 때까지 걸리는 시간
- FP: First Print, 첫 페이지를 그리기 시작하는 시간
- FCP: First Contentful Print, 첫 요소를 렌더링하는 때까지 시간
- TTI: Time To Interactive, js 실행이 완료되어서 사용자가 행동을 취할 수 있게 되는 때까지 시간
- FMP: First Meaning Pring, 사용자에게 의미있는 첫 요소가 로드될 때까지 걸리는 시간

위 지표들로 분석을 해봤을 때 FCP, LCP, TTI가 높게 나온 것을 확인할 수 있다.
이 결과는 자바스크립트 번들 파일의 사이즈가 크기 때문에 다운로드를 받는 용량이 커서 첫 페이지를 띄우기까지 시간이 오래걸린 것이 원인이라고 예상했다.

### 성능 개선

#### 요청 크기 줄이기<br />

첫 페이지를 빠르게 로딩하기 위해서 어떤 타입의 요청이 큰지 확인했다.

- **먼저 소스코드(텍스트 컨텐츠)를 확인했다.** <br /> 처음에 불러오는 자바스립트 번들 파일의 크기가 1.61MB로 상당히 용량이 크다는 것을 알게되었다.
  소스코드의 크기를 줄이기 위해서 첫 번째로 `source-map` 방식을 변경했다. <br />

  **source map이란?**<br />
  : 배포용으로 빌드한 파일과 원본 파일을 서로 연결시켜주는 기능이
  서버에 배포를 할 때, 성능 최적화를 위해서 HTML, CSS, JS파일을 압축하게 된다.
  하지만 만약 압축하여 배포한 파일에서 에러가 발생했을 경우 위치를 파악해서 디버깅하기 어렵다.
  이러한 이유로 배포용 파일의 특정 부분이 원본 파일의 어디 부분인지 확인하게 하기 위해서 source map을 사용한다.

  개발 과정에서 빌드된 파일의 크기를 희생하면서 빠른 sourceMap을 사용할 수 있지만, 프로덕션일 경우에는 최소화를 지원하는 별도의 sourceMap을 사용하는게 좋다.

  **개발에 이상적인 devtool**

  1. eval: 원본 코드 대신 transpile된 코드에 매핑되기 때문에 줄 번호가 올바르게 표시되지 않을 수 있다.
  2. eval-source-map: 처음에는 느리지만 re-build 속도가 빠르다. 원래 코드에 맵핑되기 때문에 줄 번호가 올바르게 표시된다. 개발을 위한 최고의 source map을 지원한다.
  3. eval-cheap-source-map: eval-source-map과 유사하지만 열 없이 행 번호만 맵핑하기 때문에 리소스가 적게 든다.

  **프로덕션에 이상적인 devtool**

  1. source-map: 빌드된 파일에 참조 주석을 추가해서 개발 도구가 위치를 찾을 수 있도록 한다.
  2. hidden-source-map: source-map과 동일하지만 참조 주석을 추가하지 않는다. 브라우저 개발자 도구에 sourceMap을 노출하고 싶지 않는 경우에 유용하다.
  3. nosource-source-map: sourceMap없이 sourcesContent가 생성된다. 모든 소스를 노출하지 않고 스택 추적을 위한 맵핑을 사용할 수 있다.

  프로젝트에서는 이미 `webpack-merge`를 사용해서 development 버전과 production 버전을 나누어서 관리하고 있었다.

  ```
    - webpack
      |- webpack.common.js
      |- webpack.dev.js
      |- webpack.prod.js
      |- webpack.test.js
  ```

  `webpack.common.js`에서 설정한 `devtool: eval-source-map`을 dev와 prod에서 공통적으로 사용하고 있었고, 해당 방식은 개발하는 과정에서 도움을 받을 수 있지만,
  번들에 많은 데이터를 포함시키기 때문에 production 모드에서는 적합하지 않았다. production에 적합한 devtool이 여러가지 있었고 그 중에서 `source-map`을 선택했다.

  `source-map`은 build와 re-build의 속도가 느리지만 에러가 발생했을 때 위치를 잘알 수 있고, production에 제일 적합한 sourceMap을 생성할 수 있다. 배포하는 과정에서
  빌드 속도 보다는 운영하는 과정에서 에러가 발생했을 때 어느 부분에서 발생했는지 빠르게 파악하는게 더 중요하다고 생각했다.

  `eval-source-map`에서 `source-map`으로 수정난 후 파일 크기 변화
  | devtool | 크기 |
  | ------- | --- |
  | eval-source-map | 1.61MB |
  | source-map | 311KB |
  | | 80% 감소 |

  {' '}

  <br />

  추가적으로 HTTP 압축 방식을 사용했다. Web Server로 Nginx를 사용하고 있었고, gzip이 설치되어있었기 때문에 간단한 설정을 통해서 압축을 진행했다.

  gzip을 선택한 이유는 다음과 같다.

  - 텍스트 파일을 압축하는데 있어서 최상의 성능을 낸다.
  - 대부분의 브라우저는 gzip을 내장하고 있다.
  - 자동으로 gzip으로 압축된 파일을 해제하는 기능을 탑재하고 있다.
  - nginx에 내장되어서 설치되어있기 때문에 별도로 설치할 필요가 없다.

  적용하는 4가지 방법

  - nginx 등 Web서버에서 처리하기
  - Was에서 처리하기
  - Servlet Filter를 등록하여 처리하기
  - 정적인 파일을 미리 gzip으로 압축해서 올리기
  - 서버 자원을 아끼기 위해서 정적인 파일을 미리 압축해서 관리할 수 있다.

  gzip 압축 전송의 단점으로 모든 트래픽에서 gzip 압축을 위해서 서버의 cpu와 메모리를 사용하게 된다. 비싼 서버 리소스를 더 사용하게된다.
  일반적으로 Web서버에서 처리하지만, 프로젝트의 상황에 따라서 적용을 한다.

  Web서버에서 gzip 설정하면 서버에서 HTML 데이터를 압축 후 전송했을 때, 클라이언트 브라우저가 압축을 푼다.

  ```conf title=/etc/nginx/nginx.conf
    http {
      gzip on;

      gzip_vary on;
      gzip_proxied any;
      gzip_comp_level 6;
      gzip_buffers 16 8k;
      gzip_http_version 1.1;

      gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml
        application/xml+rss
        image/svg+xml
        image/x-icon;
    }
  ```

  **Directives**

  - gzip <br />
    : 응답에 gzip 사용 여부
    `gzip [on | off]`
    defalut `off`
    <br />
    <br />
  - gzip_comp_level <br />
    : 1~9까지 있고, 숫자가 클수록 압축율은 높아지지만 압축속도가 느려진다. 레벨 6, 9를 보편적으로 사용한다.
    컴퓨터의 성능이 높아진 상태이기 때문에 9레벨을 사용하더라도 속도의 차이가 미미하므로 9레벨을 쓰는 것을 추천하는 글도 있다.
    시험을 통해서 속도의 차이가 얼마나 나는지 레벨 6와 비교해봐도 좋겠다고 생각한다.
    `gzip_comp_level [number]`
    default `1`
    <br />
    <br />
  - gzip_min_length <br />
    : 압축을 적용할 컨텐츠의 최소 사이즈
    이미 크기가 작은 파일이라면 전송하는 시간이 작기 때문에 압축하는 시간을 가지는 것의 필요성이 떨어진다.
    압축을 할 파일 크기 기준을 적당히 정해서 사용하는게 효율적이다.
    `gzip_min_length [size]`
    default `20`
    <br />
    <br />
  - gzip_buffers <br />
    : 버퍼의 숫자와 크기를 지정한다.
    nginx는 http로 들어온 request를 먼저 buffer에 넣고 처리한다.
    예를 들어서 `16 8k`는 메모리 페이지 크기에 따라서 8k단위로 16배의 메모리 공간을 설정하는 것을 나타낸다.
    기본설정을 따르는 것을 추천한다.
    `gzip_buffers [number] [size]`
    default `32 4k | 16 8k`
    <br />
    <br />
  - gzip_disable <br />
    : 해당 `User-Agent` header에 대해서 gzip을 수행하지 않는다. 정규표현식으로 작성한다.
    [User-Agent MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent)
    internet explorer 6버전은 압축을 지원하지 않기 때문에 ‘meie6’로 설정하는 글이 있는데, IE 지원이 중단되었고 엣지에서 IE모드로 스위칭하도록 되어있는데 설정을 추가해야할지, 아니면 추가적으로 해놓으면 좋을지 생각해보면 좋겠다고 생각한다.
    default `-`
    <br />
    <br />
  - gzip_http_version <br />
    : 응답을 압축하는 데 필요한 요청의 최소 HTTP 버전을 설정한다.
    `gzip_http_version [version]`
    default `1.1`
    <br />
    <br />
  - gzip_vary <br />
    : gzip이 활성화되었을 경우에 header에 `Vary: Accept-Encoding`
    을 삽입할지 결정한다.
    `gzip_vary [on | off]`
    default `off`
    {' '}
    <br />
    <br />
  - gzip_proxied <br />
    : proxy나 캐시 서버에서 요청할 경우 동작 여부를 결정한다.
    options
    - off: proxy에서 요청할 경우 압축하지 않는다.
    - expired: 요청 헤더에 Expired가 만료되었을 경우에만 압축한다.
    - no-cache: 요청 헤더에 Cache-Control이 no-cache일 경우에만 압축한다.
    - no-store: 요청 헤더에 Cache-Control이 no-store일 경우에만 압축한다.
    - any: 항상 압축한다.
      `gzip_proxied [option]`
      default `off`
      <br />
      <br />
  - gzip_types <br />
    : 압축을 진행할 content의 유형을 설정한다.
    `gzip_types type1 type2 …`
    default `text/html`

  **적용 후 응답 헤더**
  <img src="/images/posts/performance-improvement/cache-result.png" />

  {' '}

  <br />

- **두 번째로 **폰트 파일** 의 크기를 확인했다.**<br /> 체크메이트에서는 Google Web Font API를 이용하고
  있다.

  ```html
  <!DOCTYPE html>
  <html lang="ko">
    <head>
      ...
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap"
        rel="stylesheet"
      />
      ...
      <title>체크메이트</title>
    </head>
    ...
  </html>
  ```

  <br />
  <img src="/images/posts/performance-improvement/font.png" />

  `렌더링 차단 리소스 제거하기` 같은 경우에는 font를 다운로드 받는 시간동안 Rendering Blocking을 하여 FCP를 늦추는 문제가 발생하는 것이라고 예측했다.
  preconnect, preload, prefetch의 개념을 모르고 있었기 때문에 어떤 동작을 가능하게 하는지 알아봤다.
  셋 다 동일한 개념은 반드시 사용한다는 것은 전제로 브라우저에게 알려서 미리 가져온다는 것이다. <br />

  preload는 브라우저의 주요 렌더링 절차가 개입하기 전에 페이지 생명주기의 초기에서 불러온다. 해당 리소스들을 더 빨리 사용할 수 있게 하고, 페이지의 렌더링을 막을 가능성이 낮아져 성능이 향상된다. 폰트 같은 경우에는 반드시 사용되어서 빠르게 가져와야 하기 때문에 사용하기 적합하다.<br />
  preconnect는 외부 도메인의 리소스를 가져올 때, 필요한 소켓을 미리 설정해서 DNS, TCP, TLS 왕복에 필요한 시간을 절약할 수 있게 한다. 서버에 미리 연결해서 시간을 절약할 수 있는 방법이다.<br />
  prefecth는 사용될 것이라고 예측되는 리소스를 미리가져와서 캐싱을 한 다음, 바로 사용할 수 있게 만들어 대기 시간을 감소시킬 수 있다. <br />

  Google Web Font인 외부 도메인을 사용하므로 preconnect를 잘 적용하고 있었고, 폰트를 페이지 로드 시작과 함께 비동기로 font를 요청하고 받아오고 있는 것을 확인했다.
  <img src="/images/posts/performance-improvement/preconnect.png" />

  `사용하지 않는 css 지우기` 같은 경우에는 왜 뜨는지 처음에는 이해하지 못했다. 단순히 global style로 `font-family`에 해당 폰트를 추가해주고 있었기 때문이다.
  문제는 Web Font API를 통해서 받아오는 css 리소스의 크기였다.
  <img src="/images/posts/performance-improvement/font-face.png" />

  `weight`를 100, 300, 400, 500, 700, 900을 요청하고, 100을 하나만 하더라도 119개 정도의 `font-face`를 받아온다.
  실제로 사용하는 폰트는 다음과 같았다.

  <img src="/images/posts/performance-improvement/used-font1.png" />

  미팅 목록 페이지에서 16개 정도의 `font-face`를 사용하기 다른 페이지에 접근할 때, 많아야 3개 정도 더 받아오는 정도였기 때문에 불필요한 코드를 너무 많이 받아오고 있었다.
  왜 `weight 100`에 119개나 되는 `font-face`를 받아올까?

  > Google은 머신 러닝에 기반을 둔 최적화 기술을 통해 한글 문서에서 주제에 따라 사용되는 글자의 패턴을
  > 발견했다. 그 패턴에 따라 한글 폰트를 100여 가지의 그룹으로 나누고 unicode-range 속성을 사용한다.
  > 이렇게 하면 사용자가 웹 페이지를 로딩할 때 폰트 전체를 다운로드하지 않고 웹 페이지에서 사용할
  > 문자에 필요한 폰트만 선택적으로 다운로드한다. 크기가 큰 한글 폰트를 동적으로 분할 다운로드하는
  > 방법으로 용량을 최적화할 수 있게 된 것이다.
  >
  > naver D2 - 웹 폰트 사용과 최적화의 최근 동향

  `weight 100`의 `font-face`를 100개 넘게 받아오는 것은 문제가 아니라 오히려 최적화의 방법이라는 것을 알게 되었다.
  그러면 남은 방법은 사용하는 `weight` 만 받아오는 것인데, 당장은 사용하지 않지만 추후에 사용할 가능성이 크다고 판단해서 요청하는 `weight`의 수는 유지하기로 했다.

  결론적으로 폰트는 특별한 조치를 하지 않았다. `preconnect`, `display=swap`, `WOFF2` 등 최적화는 되어있는 상태였고, 나중에 Web Server에서 추가로 압축을 다했을 때도
  자바스크립트 번들 파일을 가지고 오는 시간보다 작았기 때문에 성능에 문제를 주지 않을 것이라고 판단했기 때문이다.

  <br />

- **다음으로 이미지를 확인했다.**<br /> 사용하는 이미지는 svg뿐만 아니라 갯수가 많지 않았다. 서버에서 가져오는
  시간은 평균 3밀리초로 짧은 시간에 가져오고 있었다.
  <img src="/images/posts/performance-improvement/svg-down.png" />
  최적화을 하는 것은 효과가 미미할 것이라고 예상했다. <br /> <br />

#### 필요한 때에만 요청하기

**페이지별 리소스 분리, code splitting**

하나의 파일에 사용하는 모든 자바스크립트 파일을 번들링하게되면 어플리케이션의 규모가 커졌을 때 파일을 로드하기까지 시간이 길어질 수 있다.
이런 문제를 해결하기 위해서는 코드를 분할해서 필요한 파일만 불어오게 할 수 있다. 리액트 공식문서에서는 아래와 같이 소개한다.

> 코드 분할은 여러분의 앱을 “지연 로딩” 하게 도와주고 앱 사용자에게 획기적인 성능 향상을 하게 합니다. 앱의 코드 양을 줄이지 않고도 사용자가 필요하지 않은 코드를 불러오지 않게 하며 앱의 초기화 로딩에 필요한 비용을 줄여줍니다.

다음과 같이 사용할 수 있다.

```js
const OtherComponent = React.lazy(() => import('./OtherComponent'));
```

리액트의 lazy import를 사용하게 되면 Webpack에서는 각각의 파일로 분리해서 번들링을 한다.
페이지 내부에 컴포넌트를 lazy로 불러올 필요없기 때문에 페이지 컴포넌트에 적용하는게 효과적이라고 생각한다.
라우트해서 해당 페이지로 이동할 때 서버에서 파일을 불러온다. 트레이드 오프는 해당 파일을 불러오기까지 시간이 걸리기 때문에 로딩화면을 보여줘야 하는 점이다.
이러한 단점 때문에 결과적으로 코드 분할은 선택하지 않았다.

출석체크라는 도메인 특성 상 최대한 빠른 시간안에 출석 체크를 할 수 있어야 했다. 페이지를 이동할 때 서버로 http 요청을 통해서 데이터를 요청해야하기 때문에 로딩화면을 보여주고 있는 상태였다.
코드분할까지 진행한다면 페이지를 불러오고 데이터 요청까지 이루어져서 출석부 페이지까지 이동하는데 시간이 더 걸릴 것이라고 생각했다.
다른 페이지들을 분할하면 됐지만, 로딩이 필요없는 페이지여서 로딩을 추가하면서까지 분할을 할 필요성을 느끼지 못했다.

<br />
**tree shaking**

tree shaking은 사용하지 않는 코드들을 번들에 포함시키지 않는 것을 말한다. 프로젝트에 작성한 코드 대부분은 사용을 하고 있었고, 라이브러리에서 가져올 때 tree shaking을 해야했다.
webpack은 production 모드일 경우에 tree shaking을 진행한다.

#### 캐싱

같은 리소스를 매번 서버에 요청하지 않기위해서 캐싱을 설정했다. <br />
캐싱이란 저장소 내에 리소스의 복사본을 저장하고 있다가 요청 시에 제공하는 기술을 말한다.

클라이언트와 서버 사이에서 데이터를 주고 받는 과정에서는 비용이 발생한다. 많은 왕복작업에서 크기가 큰 응답들은 브라우저의 작업 지연과 서버의 부하를 발생시킨다.
웹 캐시가 저장소 내에 요청된 리소스를 복사해서 가지고 있으면, 요청을 가로채서 서버로부터 리소스를 다시 다운로드하는 대신에 복사본을 반환한다.
캐싱을 사용함으로써 사용자는 더 빠르게 HTTP 리소스를 로드할 수 있고, 개발자는 트래픽 비용을 절감할 수 있다.

`Cache-Control` 헤더 값으로 `max-age=<seconds>` 값을 지정하여 캐시의 유효기간을 설정한다.

<img src="/images/posts/performance-improvement/cache1.png" />

▴ Cache-Control max-age 값 대신 Expires 헤더로 캐시 만료 시간을 지정할 수 있다.

**유효 기간이 지나기 전**
이라면, 서버에 요청을 보내지 않고 디스크 또는 메모리에서 캐시를 읽어와 사용한다.<br />
**유효 기간이 지난 후**
브라우저는 서버에 조건부 요청을 통해 캐시가 유효한지 재검증을 수행한다.

대표적인 재검증 요청 헤더로

- **If-None-Match**: 캐시된 리소스의 `ETag` 값과 현재 서버 리소스의 `ETag` 값이 같은지 확인한다.
- **If-Modified-Since**: 캐시된 리소스의 `Last-Modified` 값 이후에 서버 리소스가 수정되었는지 확인한다.

> ETag는 특정 버전의 리소스를 식별하는 식별자로서 ETag를 비교하여 리소스가 서로 같은지 여부를 판단한다. 리소스가 변경되면 새로운 ETag가 생성된다.

<img src="/images/posts/performance-improvement/cache2.png" />

- 재검증 결과 캐시가 유효하지 않으면, 서버는 **[200 OK]** 또는 적합한 상태 코드를 본문과 함께 내려준다.
- 재검증 결과 캐시가 유효하다면, **[304 Not Modified]**를 내려준다. 이 응답은 HTTP 본문을 포함하지 않기 때문에 매우 빠르게 내려받을 수 있다.

<br />
##### 적용

nginx `/etc/nginx/nginx.conf`에 캐시를 설정했다.

```conf /etc/nginx/sites-available/moragora.conf
  location ~* \.(tga|csv|js|json|css|png|jpg|jpeg|gif|svg|wav|swf|eot|ttf|otf|woff|woff2|flv|mp3|mp4|webp|ico)$ {
        access_log off;
        log_not_found off;
        add_header Cache-Control "public, max-age=31557600";
  }

  location ~* \.(html)$ {
          access_log on;
          log_not_found on;
          add_header Cache-Control "public, no-cache";
  }


  listen 443 ssl http2; # managed by Certbot
```

**적용 방식**

- html을 제외한 파일<br />
  캐싱 최대 기간인 1년으로 설정해서 변경사항이 없다면 해당하는 캐싱된 리소스를 그대로 사용하도록 했다. 만약 변경사항이 생겼다면 cache busting을 통해서 새로운 버전의 파일을 받아오도록 한다.

- html<br />
  `Cache-Control no-cache`는 `max-age=0`과 같다. 리소스를 요청할 때마다 매번 새로운 배포가 이루어졌는지 재요청하도록 해서 새로운 배포가 이루어졌다면 새로운 버전의 파일을 내려받도록 한다.
  이렇게 함으로써 html의 script태그를 통해서 src를 요청할 때 javascript 파일이 변경되었다면 새로 요청할 수 있게된다. 모든 파일에 대해서 재요청을 하고 재검증을 하는 것보다 효율적이다.

cache busting 설정

```js title=webpack.common.js
  module.exports = {
    ...,
    output: {
      publicPath: '/',
      path: resolve(__dirname, '../build'),
      filename: '[name].[contenthash].js',
      assetModuleFilename: 'images/[name].[hash:8][ext][query]',
      clean: true,
    },
    ...
  }
};
```

Webpack hash template string을 사용해서 ouput filename에 hash 값을 추가했다.
컴파일 수준에서 사용하는 fullhash를 제외한 보편적으로 사용하는 hash, contenthash, chunkhash 중에서 선택했다.
공통적으로 내용의 변경이 발생했을 때 hash값이 변경된다.

| hash                                                                                                                            | contenthash                                                                                                         | chunkhash                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 빌드 시점에 전체 코드를 기준으로 생성되고, 모든 hash 값은 동일하다.                                                             | 파일의 content에 따라서 hash 값이 생성된다.                                                                         | chunk 파일의 content를 기준으로 hash값이 생성된다. 같은 chunk 내에서 hash값을 공유한다.                             |
| <img width="750" src="https://user-images.githubusercontent.com/61308364/190638873-a88a5e7f-5666-45c8-a917-5bf58cb60631.png" /> | <img src="https://user-images.githubusercontent.com/61308364/190639439-19ea8f9e-a4b7-4eb0-80d4-e49f9cbca2b3.png" /> | <img src="https://user-images.githubusercontent.com/61308364/190639041-299f6e51-f4d2-4776-9233-fa4078df4320.png" /> |

webpack output.filename을 contenthash로 설정함으로써 변경되지 않은 파일에 대해서는 filename을 변경하지 않고, 그에 따라서 busting하지 않기 때문에 caching을 유지하도록 했다.
asset/resource의 filename 해시 옵션 파일은 asset/resource 모듈은 기본적으로 출력 디렉터리로 내보낼 때 [hash][ext][query] 파일명을 사용하기 때문에 images/[name].[hash][ext][query]을 사용했다.

**적용 후**
<img src="/images/posts/performance-improvement/caching-file.png" />

## 마무리

이번 성능 최적화 작업을 하면서 느낀점은 간단한 설정만을 통해서도 파일 사이즈를 줄일 수 있고, 로드 속도를 줄일 수 있다는 점이다. Webpack에서는 최적화할 수 있는 다양한 plugin을 사용할 수 있다.
예를 들어 html-webpack-plugin을 통해서 공백, 주석 등을 삭제할 수 있으며, css-minimizer-webpack-plugin을 통해서 css도 압축이 가능하다. 추가로 HTTP 압축 방식으로 brotli를 사용하면 gzip을
사용할 때보다 30%정도 더 압축할 수 있다고 한다. 새로 설치해야하는 불편함이 있어서 적용하지 않았지만 적용을 해보고 비교해보는 해봐야겠다고 생각한다.
