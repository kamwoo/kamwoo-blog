---
title: Function
published: true
category: js
subtitle: JavaScript 함수의 일급 객체 특성, 함수 선언문과 표현식, 화살표 함수, 즉시 실행 함수의 특징
date: 2022-04-24
---

자바스크립트의 함수는 일급객체로 아래와 같은 특징을 가진다.

- 변수에 할당할 수 있다.
- 다른 함수에 인자로 전달될 수 있다.
- 리턴값으로 사용될 수 있다.

자바스크립트에서 함수는 일급 객체로

- 변수나 자료구조에 할당 할 수 있다.
- 다른 함수에 인자로 전달할 수 있다.
- 다른 함수의 결과로서 리턴될 수 있다.

함수 자체가 객체이고, 객체는 곧 값이다.

따라서 자바스크립트의 함수도 객체의 프로퍼티로 사용할 수 있다.

일반 객체와 차이점

- 자바스크립트의 함수는 함수 객체라고 하는 특수한 유형의 객체이다.
    
- 일반 객체는 호출 할 수 없지만, 함수는 호출할 수 있다.
    
    따라서 함수 객체는 일반 객체가 가지고 있지 않는 [[Evironment]] 슬롯이나 [[Call]], [[Constructor]]와 같은 내부 메서드를 추가로 가지고 있다. 일반함수일 경우에는 Call을 사용하고, new랑 같이 생성자 함수로 사용될 때는 contructor를 호출한다.
    
    모든 함수가 [[Constructor]]를 가지는 것은 아니다.
    
    constructor: 일반 함수, 클래스(클래스도 함수), 함수 표현식
    
    non-constructor: 화살표 함수, 객체에서 축약으로 선언된 메서드
    
- 함수 고유의 프로퍼티를 소유한다.
    

함수는 반드시 return을 하며, 리턴값이 없을 경우에는 undefined가 반환된다.

자바스크립트 함수는 선언한 파라미터보다 더 많은 인자를 받을 수 있다.

함수 선언문은

```jsx
function kam(){
 return "woo"
}
```

로 일반적으로 사용되는 형태를 가진다.

함수 표현식

```jsx
const one = function(){
	return "익명 함수"
}

const two = function casetwo(){
	return "기명 함수"
}

```

- 함수가 할당된 변수는 name이라는 속성을 가진다.
    - [one.name](http://one.name) = one
    - [two.name](http://two.name) = casetwo

콜백 함수에 주로 사용된다.

함수 선언문과 함수 표현식을 생성 시점이 다르다.

---

화살표 함수

```jsx
const greeting = () => {}
```

함수 표현식보다 단순하고 간결하게 만들 수 있다.

```jsx
const tooLong = function(a){
	return function(b){
		return a+b
	}
}

const short = a => b => a+b
```

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
	greeting (){
		return this  // obj
	}
}

const obj = {
	greeting: () => this // 전역객체 this -> obj의 this -> window
}

```

정리

메소드 내부 함수에서 this는 전역객체

하지만 화살표 함수는 항상 상위 스코프의 this가 this

메소드로서 사용하려면 함수 선언문, 함수 표현식을 사용하고

화살표 함수는 메소드 안에서 같은 this를 바라보게, 내부 함수로서 사용하는 경우에 사용

즉시 실행 함수

```jsx
(function (name)) {
	//내부 로직
})(name에 들어갈 인자)
```

- 클로저에 활용
    
    스코프를 이용해서 전역으로 선언되는 것을 피할 수 있다.