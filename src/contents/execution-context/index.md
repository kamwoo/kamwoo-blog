---
title: Execution Context
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-04-06
---

> 작성한 자바스크립트 코드가 실행되기 위해서 필요한 환경

실행에 필요한 정보

- 변수
- 함수 선언
- 변수의 유효범위(스코프)
- this

실행 컨텍스트가 생성되는 시점

- 전역 공간
- 함수
- eval 함수

js는 대소문자를 구별하며 유니코드 문자셋을 이용한다.

명령문(statement)끝에 ;을붙인다.

- 선언:
    
    a = 1 일 때 a라는 변수를 선언했다라고 한다.
    
- 초기화:
    
    최초로 값을 저장(할당)하는 것을 초기화라고 한다.
    

자바스크립트는 실행하기전 소스코드를 먼저 스캔한다.

전체를 스캔하는 것이 아니라 실행된 컨텍스트 내의 소스 코드를 스캔한다.

즉, 콜 스택에 쌓이고 실행이 된 후

1. a = 1 이라는 선언문을 발견하면 a 변수를 ‘실행 컨택스트’라는 곳에 등록한다.
2. 스캔이 완료되면 위에서부터 한 줄씩 실행한다.
3. a = 1 이라는 선언문을 만나면 메모리 공간에 1을 할당하고 그 메모리 공간의 주소를 a에 저장한다.
4. a = 2 라는 선언문을 만나면 새로운 메모리 공간에 2를 할당하고 그 메모리 공간의 주소를 a에 저장한다.
5. 사용하지 않는 1의 메모리 공간은 GC가 메모리에서 해제한다.

실행 컨텍스트: 코드가 실행되기 위한 환경과 코드의 실행 결과를 관리하는 영역, 식별자 스코프를 가지는 객체

아래와 같은 구성을 가진다.

- Variable Enviroment: 현재 컨텍스트 내의 식별자들에 대한 정보, 외부환경 정보
    - 식별자: 매개변수, 선언된 함수 등
- Lexical Enviroment: VE를 복사해서 가지고, 변경사항이 실시간으로 반영.
    - 내부에서 스코프 체이닝으로 접근해서 VE를 복사본에 찾는 식별자가 존재하는지 확인
- This Binding: this 식별자가 바라보는 대상

VE, LE는 **enviromentRecord**와 **outerEnviromentReference**를 가진다.

**enviromentRecord**는 식별자 정보를 수집하는 역할로 아래와 같이 다시 나눠진다.

- Declarative Enviroment Record:
    - 함수, 변수 식별자 정보
    - 화살표 함수가 아니라면 this 바인딩 제공
    - 전역에서 const, let으로 선언된 변수
- Object Eviroment Record:
    - 식별자를 어떤 객체의 속성으로 취급할 때 사용
    - 그 어떤 객체를 `binding object`라는 속성으로 정의
    - 전역에서 var로 선언된 변수
- Global Enviroment Record
    - 전역으로 관리되는 정보가 담긴다.
    - 전역 컨텍스트의 Declarative Enviroment Record, Object Eviroment Record를 가진다.

**outerEnviromentReference**는

enviromentRecord를 식별자의 유효범위에 대한 정보를 담는다.

변수, 함수가 선언되는 시점에서 Lexical Enviroment를 참조하는 포인터로서 상위에 Lexical Enviroment를 계속 찾아 올라간다. 그러므로 가장 가까운 요소부터 차례대로 접근하게 된다.

이러한 과정을 scope chain이라고 한다.

[[Scopes]]에 자신의 LE와 외부의 LE, 전역 객체를 저장하여 차례로 접근한다.

This Binding

: 내부 this가 바라보고 있는 대상 객체를 저장

콜스택(call stack): 원시값과 실행 컨텍스트를 저장

힙(heap): 객체, 배열, 함수와 값이 크기가 동적으로 변할 수 있는 참조타입 값 저장

원시값을 변수가 변경하려는 값이 저장되어있으면 그 메모리 주소로 변경한다.

참조값은 동적으로 변경시킬 수 있으므로 똑같은 값을 가지더라고 생성할 때마다 별도의 메모리에 저장한다.

실행 컨텍스트는 아래와 같은 상황일 때 call stack에 쌓인다.

1. 전역 공간은 자동으로 컨텍스트로 구성된다.
2. 함수를 실행했을 때
3. eval 함수를 실행했을 때

브라우저 컨트롤이 실행 컨텍스트가 접근하기 전에 전역 객체가 생성되고, 전역 객체는 BOM, DOM, 빌트인 객체(Number, Array 등)이 들어간다.

```jsx
var x = 'xxx';

function foo () {
  var y = 'yyy';

  function bar () {
    var z = 'zzz';
    console.log(x + y + z);
  }
  bar();
}

foo();
```

<img src="/images/posts/execution-context/1.png" />

ex)

```jsx
let a = 10;

let b = 20;

function c () {

	let d = 30;
	
	let e = 40;

}

c();
```

1. 콜 스택에서 전역 컨텍스트를 먼저 실행시킨다.
2. 스캔을 하면서 a, b, c 식별자에 대한 정보를 컨텍스트에 저장한다.
3. 위에서 한 줄씩 실행
4. a = 10을 만나면 10은 원시값이므로 콜스택 메모리에 저장하고 메모리 주소를 a에 저장
5. b = 20을 만나면 20은 원시값ㅇ므로 콜스택 메모리에 저장하고 메모리 주소를 b에 저장
6. c 함수는 참조값으로 힙 메모리에 저장하고 힙 메모리 주소를 콜 스택 메모리에 저장, 콜 스택 메모리 주소를 c에 저장
7. c 함수 실행을 만나면, 콜스택에 c 실행 컨텍스트를 쌓는다.
8. c함수 내부를 스캔하면서 d, c 식별자에 대한 정보를 c 실행 컨텍스트에 저장
9. c함수 내부를 위에서부터 한 줄씩 실행
10. d = 30을 만나면 콜스택에 30을 저장 후 d에 메모리 주소를 저장
11. e = 40을 만나면 콜스택에 40을 저장 후 e에 메모리 주소를 저장