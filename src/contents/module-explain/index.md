---
title: Module
date: 2022-09-12
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
---

<div align="center">
<img src="/images/posts/module-explain/pocketball.png" />
</div>

## Module이란

Google에 Module을 검색하면 다양한 의미를 볼 수 있다.

> "본체에 대한 독립된 하위 단위"

> "프로그램을 구성하는 시스템을 기능 단위로 독립적인 부분"

> "보다 작고 이해할 수 있는 단위로 나눈 것"

> "재활용 가능한 코드 단위"

위 단어들을 조합하면 모듈은 "재활용 가능한 독립된 단위로써 시스템을 구성한다"고 할 수 있다. 좀 더 직관적으로 ESM(ES6 Module)을 사용하는 상황에서 파일을 모듈이라고 말할 수 있다.

**모듈은 파일이다.. 그러면 파일이라고 하면 되지 왜 굳이 모듈이라고 할까?** <br />
단순히 파일이라고 말하지 않는 이유는 html의 script 태그를 보면 알 수 있다. script 태그를 사용해서 여러 JS파일을 로드할 수 있지만 `type="module"` 이 아닐 경우에 독립적인 파일 스코프를 갖지 않는다. 따라서 하나의 데이터 블럭으로 간주하여 동일한 영역을 공유하기 때문에 변수가 중복되는 문제가 발생할 수 있다.

<div align='center'>
<img width='300' src="/images/posts/module-explain/1-1.png" />
<img width='300' src="/images/posts/module-explain/1-2.png" />
<img width='400' src="/images/posts/module-explain/1-3.png" />
</div>

반대로 script 태그에 `type="module"` 속성을 추가한다면 모듈로 간주해서 에러가 발생하지 않는다.

<div align='center'>
<img width='300' src="/images/posts/module-explain/2-1.png" />
<img width='300' src="/images/posts/module-explain/2-2.png" />
<img width='400' src="/images/posts/module-explain/2-3.png" />
</div>

그 밖에 모듈이 가지는 일반 스크립트와의 차이점으로는 아래 등등 있다.<br />

- 지연 실행
- 인라인 스크립트의 비동기 처리
- 처음 호출시 한번만 실행
- strict 모드

그렇다면 모듈로 만들면 뭐가 다르기에 위와 같은 결과를 보여줄까

### 모듈의 조건

- 스코프
- 정의
- 사용

위에서 말한 문제점을 해결하기 위해서는 모듈은 독자적인 스코프를 갖는다. 모듈 내에서 선언한 변수는 기본적으로 모듈 내에서만 사용할 수 있다. 따라서 명시적으로 내보내지 않는다면 외부에서 사용할 수 없다. 내부에서 선언한 식별자를 외부로 공개하기 위해서 export를 통해서 정의할 수 있다. 또한 사용하고자 하는 곳에서 import를 통해서 다른 모듈에서 공개한 식별자를 사용한다.

## Module을 사용하는 이유는?

어플리케이션의 규모가 커지고 복잡해지면서 JS 코드가 많아졌고, 모듈 단위로 많은 양의 코드를 한 파일에서 관리하면 유지/보수하기 힘들어졌다. 기능별로, 관심사별로 모듈을 나눠서 관리함으로써 문제를 해결할 수 있다. 또한 모듈을 필요한 곳에서 재사용해서 효율을 높일 수 있다.

하지만 모든 파일을 script 태그를 통해서 추가하고 제거하기 번거롭고, 파일을 로드하는데에 시간이 걸렸다. 따라서 모듈 시스템의 필요성을 느끼기 시작하고, 초창기에 코드를 모듈 단위로 구성할 수 있게 해주는 모듈 시스템들이 등장했다. 대표적으로 CommonJS, AMD가 있다.

- CommonJS

  이름에서 유추할 수 있듯이 Javascript를 일반적인 범용언어로 사용할 수 있도록 한 것이다.
  브라우저 환경이 아닌, 예를 들어 서버 사이드에서 사용하기 위해서는 아래와 같은 문제를 해결해야 했다.

  - 서로 호환되는 표준 라이브러리가 없다.
  - 데이터베이스에 연결할 수 있는 표준 인터페이스가 없다.
  - 다른 모듈을 삽입하는 표준적인 방법이 없다.
  - 코드를 패키징해서 배포하고 설치하는 방법이 필요하다.
  - 의존성 문제까지 해결하는 공통 패키지 모듈 저장소가 필요하다.<br />
    [네이버 D2: JavaScript 표준을 위한 움직임: CommonJS와 AMD](<[https://d2.naver.com/helloworld/12864](https://d2.naver.com/helloworld/12864)>)

  이러한 문제를 해결하는 방법으로써 모듈 시스템을 만들었다.

  Node.js가 CommonJS의 모듈 명세에 따라서 모듈 로더 시스템을 만들기 시작했고, 현재는 ESM과 CommonJS를 모두 지원한다.

  require와 exports를 사용해서 모듈화한다.

  ```js title=A.js highlight=7-9,16 withLineNumbers
  let a = 1;
  exports.a = a;
  ```

  ```js title=B.js highlight=7-9,16 withLineNumbers
  let A = require('./A.js');
  let result = A.a;
  ```

- AMD (Asynchronous Module Definition)

  > AMD 그룹은 비동기 상황에서도 JavaScript 모듈을 쓰기 위해 CommonJS에서 함께 논의하다 합의점을 이루지 못하고 독립한 그룹

  이라고 한다. 그렇기 때문에 CommonJS와 유사한 부분이 많다. require와 exports를 사용할 수 있고, define 함수를 통해서 파일 스코프의 역할을 대신한다고 한다.
  RequireJS가 AMD의 모듈 명세를 따라서 모듈 로더 시스템을 만들고 있다.

## **ES6 Module(ESM)**

ECMA Script2015부터 모듈 기능 명세가 추가되었고, 대부분의 브라우저에서 모듈 기능을 사용할 수 있다. import, export, from, default과 같은 키워드를 사용함으로써 직관적이고 명시적으로 사용할 수 있기 때문에 가독성이 좋다.

**ESM의 장점**은 아래와 같다.

1. 전역 코드에서 모듈식 코드로 손쉬운 재할당
2. AMD, CommonJS 및 Node.js와 같은 기존 JS 모듈 시스템과의 원활한 상호 운용성
3. 빠른 데이터 정렬
4. 라이브러리 공유를 위한 표준화된 프로토콜
5. 브라우저 및 비 브라우저 환경과의 호환성

**사용법**은 간단하다. A 파일에서 export하고 B 파일에서 import해서 가져와서 사용할 수 있다. import / export 는 최상위 레벨에서 작성되어야 한다.

```js title=A.js highlight=7-9,16 withLineNumbers
export const a = 1;

const b = 2;
export default b;
```

```js title=B.js highlight=7-9,16 withLineNumbers
import b, { a } from './A';

console.log(a); // 1
console.log(b); // 2
```

### **ESM 동작 방식**

**construction(구성)**

1. 진입 파일로부터 시작해서 import 문을 따라서 코드(파일)의 위치를 파악한다. 이 과정을 Module Resolution이라고 한다.

<img src="/images/posts/module-explain/3-1.png" />

2. 파일 시스템에서 로드하여 파일을 가져온다.
3. 파일 그 자체로는 브라우저에서 사용할 수 없기 때문에 [Module Record](https://262.ecma-international.org/6.0/#table-36)라는 데이터 구조로 변환해야한다.<br />
   Module Record로 변환하기 위해서 모든 파일을 구문 분석한다.

<img src="/images/posts/module-explain/3-2.png" />

4. Module Record가 생성되면 Module Map에 배치된다. Module Map에서 캐시를 관리하고, 요청할 때마로로더가 해당 맵에서 가져온다.
5. 하나의 파일을 구문 분석한 다음, 해당 파일에서 종속성을 파악해서 다음 종속성을 찾고 로드한다.<br />

  <img src="/images/posts/module-explain/4-1.png" />

메인 스레드에서 이와 같이 각 파일들을 가져올 때까지 기다린다면 앱이 느려지게 되므로 ES spec에서는 알고리즘을 여러 단계로 분할한다.

**Instantiation(인스턴스화)**<br />
인스턴스화는 코드(파일)과 상태(모든 변수의 값)를 겹합하는 것을 말한다.

6. JS 엔진은 Module Environment Record를 생성한다. Module Record에 대한 변수를 관리한다.

<img src="/images/posts/module-explain/4-2.png" />

7. export한 모든 값을 저장할 메모리 공간을 찾는다. 아직 값을 채우지 않은 상태이다.
8. import와 export가 모두 해당 메모리 공간을 가르키도록 한다. 이 과정을 Linking이라고 한다.

<img src="/images/posts/module-explain/4-3.png" />

**Evaluation(평가)**

9. 코드를 실행해서 실제 값을 메모리 공간에 할당한다. 평가는 수행하는 횟수에 따라 결과가 다를 수 있기 때문에 평가하는 것도 사이드 이펙트를 유발할 수 있다. 모듈을 한 번만 평가하려는 이유도 이런 상황을 방지하기 위해서 이다. Module Map을 통해서 캐싱해서 한 번만 실행되도록 한다.

### 사용하면서 생각해볼 점

**export와 export default**<br />
export default는 ‘해당 모듈엔 개체가 하나만 있다’는 것을 말한다. export(named export)와 default export를 둘 다 사용할 수 있지만 한 파일에서는 의미에 맞게 둘 중 하나의 방식만을 사용하는 것이 권장된다.<br />
export default는 파일당 최대 하나가 있을 수 있기 때문에 내보낼 개체엔 이름이 없어도 괜찮고, 개발자가 원하는 대로 이름을 지정해 줄 수도 있다. 이렇게 자유롭게 이름을 짓다 보면 같은 걸 가져오는데도 이름이 달라 혼란의 여지가 생길 수 있기 때문에 파일 이름과 동일한 이름을 사용하는 것이 추후에 발생할 수 있는 문제를 예방할 수 있다.

**re-export**<br />
import / from 뿐만 아니라 export / from도 가능하다. 개체를 가져온 즉시 내보낼 수 있다. 이 방법은 분산되서 구현되어있는 모듈을 하나로 합치는데에 사용할 수 있다. 주로 패키기를 만들 때 외부 사용자에게 편리함을 제공하면서, 접근하지 않아도될 파일을 노출하지 않을 수 있다. 일반적으로 개발할 때는 개인적으로 사용할 필요성을 느끼지는 못했다.

예를 들어서 아래와 같은 구조일 때

```
components/
        index.js
        a.js
        b.js
        c.js
        ...
```

```js title=index.js highlight=7-9,16 withLineNumbers
// index.js
export { A } from './a.js';
export { B } from './b.js';
```

```js title=어딘가.js highlight=7-9 withLineNumbers
// 어딘가
import { A, B } from 'components/index.js';
```

**필요한 것만 가져오기**<br />
코드를 작성하다보면 파일 모듈을 그대로 가져와서 사용하면 조금 편하다고 느낄 수 있다. 하지만 추후에 Webpack을 사용하면서 필요없는 코드를 번들에 포함시키지 않는 tree-shaking을 할 때, ESM에 의존적이기 때문에 모듈 전체를 가져오기 보다는 필요한 것만 가져오는 습관을 들이는 것이 좋다.

> It relies on the [import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) and [export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) statements to detect if code modules are exported and imported for use between JavaScript files.

```js title=A.js highlight=7-9 withLineNumbers
import * as A from './a.js';
A.a;

vs;

import { a } from './a.js';
```

## 알아본 것

- Module이란 무엇인가
- Module을 사용하는 이유
- Module System

## 참고 문서

[https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)<br />
[https://262.ecma-international.org/](https://262.ecma-international.org/)
