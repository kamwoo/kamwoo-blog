---
title: Short circuit evaluation
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-06-01
---

# 단축 평가

논리연산의 결과를 결정하는 피연산자를 그대로 반환한다.

좌항에서 우항으로 평가가 진행된다.

- ||와 false를 이용, 기본값 연산

```jsx
const a;
if (b){
	a = b
} else if(c){
	a = c
} else {
	a = d
}

const a = b || c || d
```

1. b가 true면 a = b
2. b가 false면 a = c
3. c가 false면 a = d

주로 기본값을 설정할 때 많이 사용한다.

- &&과 true를 이용, 보호 연산

```jsx
const a = b
if (b) {
	a = c
	if (c){
		a = d
	}
}

const a = b && c && d
```

1. b가 false면 a = b
2. b가 true면 a = c
3. c가 true면 a = d

보호연산이라는 이유는 객체 내 값에 접근할 때 사용가능해서 이다.

obj 안에 메소드, 다른 메소드 이렇게 된다고 할 때

`const a = obj && obj.method && obj.other` 이런식으로 접근하면 에러를 피할 수 있다.

- !! boolean 변환

```jsx
const a = true
const b = false

!!a // true
!!b // false
```

- ?. 옵셔널 체이닝

```jsx
const obj = null;

const value = obj ?. value // 아래와 같다.
const value = obj && obj.value 
```

객체를 가르키고 null, undefined가 아니라면 프로퍼티를 참조한다.

- ?? null 병합 연산자

```jsx
const value = null ?? "anthing"
```

피연산자가 null, undefined인 경우 우항을 반환한다.

|| 와 똑같아 보이지만 좌항의 피연사가 0, ‘’등과 같이 false일 때도 사용할 수 있다.