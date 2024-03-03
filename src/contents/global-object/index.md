---
title: js global object
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-06-03
---

# 전역 객체

> 전역 객체는 브라우저 환경에서는 window, node 환경에서는 global이 전역 객체를 가르킨다.

전역 객체는 코드가 실행되기 전에 가장 먼저 생성되는 객체로서 어떤 객체에도 속하지 않는 최상위 객체이다.

전역객체는 빌트인 객체와 호스트 객체, 전역에서 var로 선언한 변수와 전역 함수를 프로퍼티로 갖는다.

### 특징

- 개발자가 의도적으로 생성할 수 없다.
- 전역 객체의 프로퍼티를 참조할 때 window를 생략할 수 있다.

암묵적 전역

```tsx
var x = 10; // window.x에 10으로 저장

function foo() {
	y = 20;
}

foo();

console.log(x + y); // 30
```

위 코드가 에러가 나지 않는 이유는 다음과 같다.

foo함수가 실행되면 스코프 체인을 통해서 선언된 변수가 있는지 확인하고 없으면 window.y로 해석해서 동적으로 전역객체에 프로퍼티를 생성한다.

이러한 현상을 암묵적인 전역이라고 하고, y는 변수가 아니라 window의 프로퍼티에 불가하기 때문에 호이스팅되지 않고, delete 연산자로 삭제할 수 있다.