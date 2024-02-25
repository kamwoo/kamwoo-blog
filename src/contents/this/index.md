---
title: this
date: 2022-04-18
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
---

## 정의

this는 현재 속해있는 객체를 가르키는 참조 값을 가지는 변수다.

## 설명

### this의 값은 런타임에 결정되기 때문에 컨텍스트에 따라 다르다

변수 선언 처리가 끝나면 다음은 this value가 결정된다. this value가 결정되기 이전에 this는 전역 객체를 가**리**키고 있다가 \*\*\*\*함수 호출 패턴에 의해 this에 할당되는 값이 결정된다.
전역 코드의 경우, this는 전역 객체를 가리킨다.

<div align='center'>
  <img width='500' src="/images/posts/this/ex.png" />
</div>

this 프로퍼티에는 this 값이 할당된다. this에 할당되는 값은 함수 호출 패턴에 의해 결정된다.

⇒ 동일한 함수라도 다른 객체에서 호출할 때 this가 달라진다.

⇒ 메소드가 어디에서 정의됐는지와 상관없이 this가 무엇인가에 따라 자유롭게 결정된다.

### Binding 규칙

자바스크립트의 경우 함수 호출 방식에 의해 this에 바인딩할 어떤 객체가 동적으로 결정된다. 다시 말해, 함수를 선언할 때 this에 바인딩할 객체가 정적으로 결정되는 것이 아니고, 함수를 호출할 때 함수가 어떻게 호출되었는지에 따라 this에 바인딩할 객체가 동적으로 결정된다.

- 기본 바인딩<br />

  - 기본적으로 `this`는 전역객체(Global object)에 바인딩된다. 전역함수는 물론이고 심지어 내부함수의 경우도 `this`는 외부함수가 아닌 전역객체에 바인딩된다.<br />
  - 생성자 함수와 메소드를 제외한 메소드 내부 함수, 콜백 함수 등 모든 함수 내부의 this는 전역객체를 가리킨다. 브라우저 환경에서 비엄격 모드일 경우 this는 window, 엄격 모드에서는 undefined 이다.<br />
  - 내부함수는 일반 함수, 메소드, 콜백함수 어디에서 선언되었든 관게없이 this는 전역객체를 바인딩한다.

    더글라스 크락포드는 “이것은 설계 단계의 결함으로 메소드가 내부함수를 사용하여 자신의 작업을 돕게 할 수 없다는 것을 의미한다” 라고 말한다.<br />
    ⇒ 화살표 함수를 사용해서 상위 스코프의 this를 사용하게 된다.

- 명시적 바인딩<br />
  this를 특정 객체에 명시적으로 바인딩하는 방법도 제공된다.
  - call
    `func.call(thisArg[, arg1[, arg2[, ...]]])`
    **`call()`**메소드는 주어진 `this`값 및 각각 전달된 인수와 함께 함수를 호출한다.
  - apply
    `func.apply(thisArg, [argsArray])`
    `apply()`를 사용해, 새로운 객체마다 메소드를 재작성할 필요없이 한 번만 작성해 다른 객체에 상속시킬 수 있다.
  - bind
    `func.bind(thisArg[, arg1[, arg2[, ...]]])`
    `bind()`함수는 새로운 바인딩한 함수를 만든다. 바인딩한 함수를 호출하면 일반적으로 래핑된 함수가 호출 된다.
- 암시적 바인딩<br />
  함수가 객체의 프로퍼티 값이면 메소드로서 호출된다. 이때 메소드 내부의 `this`는 해당 메소드를 소유한 객체, 즉 해당 메소드를 호출한 객체에 바인딩된다.
- new 바인딩<br />
  일반함수와 생성자 함수의 차이점은 호출 시 this 바인딩 방식이 다르다.
  일반 함수를 호출하면 this는 전역객체에 바인딩되지만 new 연산자와 함께 생성자 함수를 호출하면 this는 생성자 함수가 암묵적으로 생성한 빈 객체에 바인딩된다.

바인딩 우선순위는 new 바인딩 > 명시적 바인딩 > 암시적 바인딩 > 기본 바인딩

### 화살표 함수에서 this

화살표 함수 특징

- this나 super에 대한 바인딩이 없고, 메소드로 사용될 수 없다.
- 스코프를 지정할 때 사용되는 call, apply, bind 메소드를 사용할 수 없다.
- 생성자로 사용될 수 없다.
- 함수 내부에서 yield를 사용할 수 없다.
- this, prototype, arguments가 없다.

화살표 함수는 자신의 this가 없고 함수를 둘러싸는 lexical 범위의 this가 사용된다.

⇒ 상위 스코프에 this를 찾는다.

화살표 함수는 호출되면서 생긴 실행 컨텍스트에 thisBinding을 저장하지 않는다. 때문에 실행 컨텍스트가 참조하는 this를 찾는다.

```jsx
const obj = {
  greeting() {
    return this; // obj
  },
};

const obj = {
  greeting: () => this, // 전역객체 this -> obj의 this -> window
};
```

화살표 함수는 메소드 안에서 같은 this를 바라보게, 내부 함수로서 사용하는 경우에 사용

자바스크립트의 this는 모든 함수에서 사용가능하다

```jsx
function greeting() {
  return this.name + 'hi';
}

let user1 = { name: 'kam' };
let user2 = { name: 'woo' };

user1.hi = greeting;
user2.hi = greeting;

user1.hi(); // 'kamhi'
user2.hi(); // 'woohi'
```

1. 전역에서 this는 전역객체
2. 객체에 속한 메소드에서 사용될 때 this는 메소드가 속한 객체
3. 객체에 속한 메소드 내부 함수에서 사용될 때 this는 전역객체

### 함수에서 this

함수가 호출될 때 인자값 외에 arguments 객체와 this를 전달받는다.

⇒ 함수 호출 방식에 의해 this에 바인딩할 객체가 동적으로 결정된다.

생성자 함수와 메소드를 제외한 메소드 내부 함수, 콜백 함수 등 모든 함수 내부의 this는 전역객체를 가리킨다.

함수의 실행되었을 때 this가 결정되는 것을 binding이라고 한다.

브라우저에서 this는 window라는 전역 객체를 가르키고, node 환경에서는 global을 가르킨다.

전역객체는 전역 스코프(Global Scope)를 갖는 전역변수(Global variable)를 프로퍼티로 소유한다. 글로벌 영역에 선언한 함수는 전역객체의 프로퍼티로 접근할 수 있는 전역 변수의 메소드이다.
