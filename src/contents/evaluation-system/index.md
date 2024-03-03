---
title: evaluation strategy
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-04-02
---


call by ~ 를 평가 전략이라고 한다.

평가 전략이란

> 프로그래밍 언어에서 함수 호출의 argument의 순서를 언제 결정하고 함수에 어떤 종류의 값을 통과시킬 지 결정하는 것

parameter

: 함수 내부에서 사용하는 인자

```jsx
function greeting(name){
	// name이 parameter
}
```

argument

: 함수에 넘겨주는 인자

```jsx
greeting("kam") // kam이 argument
```

## call by value

1. arguments로 값이 넘어온다.
2. 값이 넘어 올 때 복사된 값이 넘어온다.
3. caller가 인자를 복사해서 넘겨줬기 때문에 함수 내부에서 일어나는 일로 외부에 존재하는 인자에 영향을 주지 않는다.