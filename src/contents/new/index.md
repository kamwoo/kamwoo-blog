---
title: New
published: true
category: js
subtitle: JavaScript new 연산자와 생성자 함수의 동작 과정과 익명 생성자 함수를 사용한 캡슐화
date: 2022-05-03
---

생성자 함수

```jsx
function User(name){
	// this = {}
	this.name = name
	this.developer = false
	// return this
}

let user = new User("jung")
```

다음의 코드를 실행시키면 아래와 같은 동작 과정을 거친다.

1. 빈 객체를 만들어 this에 할당한다.
2. 함수를 실행해 this에 새로운 프로퍼티를 추가한다.
3. this를 반환한다.

재사용할 필요가 없을 때 익명 생성자 함수로 감싸주는 방식을 사용할 수 있다.

```jsx
let user = new function(){
	this.name = "kam";
	this.developer = true;
}
```

처음 단 한번만 실행되기 때문에 재사용을 막으면서 캡슐화할 수 있다.