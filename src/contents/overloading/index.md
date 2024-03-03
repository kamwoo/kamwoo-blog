---
title: Overloading
published: true
category: typescript
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-07-22
---


함수명이 동일하지만 매개변수를 다르게 만들어 하나의 메소드로 다른 인자를 받을 수 있다.

자바스크립트에서는 안되지만 타입스크립트에서는 가능하다.

⇒ 타입을 다양하게 지정 위해서

오버로딩을 할 때는 순서를 지켜야한다.

1. 함수 선언
2. 함수 정의
3. 함수 호출

예시 1
```tsx
function disp(n: number): void;
function disp(n: number, s: string): void;
function disp(n: number, s: string, n2: number): void;

function disp(n: number, s?: string, n2?: number): void {
  // ? 를 사용하여 s와 n2를 선택적으로 파라미터를 받는다.
  console.log(n, s, n2);
}

disp(100); // 100 undefined undefined
disp(200, '홍길동'); // 200 홍길동 undefined
disp(300, '홍길동', 25); // 300 홍길동 25
---

function x(n: number): void;
function x(n: string): void;

function x(n: any): void {
  console.log(n);
}

---

function disp2(n: number): void;
function disp2(s: string): void;
function disp2(s: string, n: number): void;
function disp2(n: number, s: string): void;

function disp2(n: any, s?: any): void {
  console.log(n, s);
}
```
