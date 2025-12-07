---
title: Type guard
published: true
category: typescript
subtitle: TypeScript 타입 가드를 사용한 타입 좁히기(narrowing)와 typeof, instanceof, in 연산자 활용법
date: 2022-07-15
---


narrowing: type guard 나 할당된 것을 보고 선언된거 보다 더욱 구체적인 타입으로 축소하는 것

여러가지 타입이 들어올 수 있을 때 예를 들어 항상 null 값이 아니라는 보장이 없을 때, 생각하는 타입이 아닐 때 를 고려하고 예외처리해서 에러없이 사용할 수 있다.

1. typeof
    
    해당하는 객체가 원시값의 타입을 가질 때 사용할 수 있다.
    
    `typeof foo === ‘string’`
    
2. instanceof
    
    클래스를 비교할 수 있을 때
    
    ```tsx
    class Foo {}
    
    if (x instanceof Foo){}
    ```
    
3. in
    
    interface, type alias로 비교를 해야될 때
    
    ```tsx
    interface User {
        name: string;
        age: number;
        occupation: string;
    }
    
    function check(person: User | Admin){
    	if ('occupation' in person){}
    }
    ```
    
4. 객체 리터럴
    
    ```tsx
    type TriState = 'yes' | 'no' | 'unknown';
    
    function logOutState(state:TriState) {
      if (state == 'yes') {
      console.log('사용자가 yes를 골랐습니다');
      } else if (state == 'no') {
      console.log('사용자가 no를 골랐습니다');
      } else {
      console.log('사용자가 아직 결정을 내리지 않았습니다.');
      }
    }
    ```
    
5. null, undefined
    
    ```tsx
    function foo(a?: number | null){
    	if (a !== null) return
    }
    ```
    
6. type alias
    
    ```tsx
    /**
     * 일반적인 인터페이스 예
     */
    interface Foo {
      foo: number;
      common: string;
    }
    
    interface Bar {
      bar: number;
      common: string;
    }
    
    /**
     * 사용자 정의 Type Guard!
     */
    function isFoo(arg: any): arg is Foo {
      return arg.foo !== undefined;
    }
    
    /**
     * 사용자 정의 Type Guard 사용 예시
     */
    function doStuff(arg: Foo | Bar) {
      if (isFoo(arg)) {
        console.log(arg.foo); // ㅇㅋ
        console.log(arg.bar); // Error!
      }
      else {
        console.log(arg.foo); // Error!
        console.log(arg.bar); // ㅇㅋ
      }
    }
    
    doStuff({ foo: 123, common: '123' });
    doStuff({ bar: 123, common: '123' });
    ```
    
    리턴값을 명시해주지 않았을 때 true, false의 타입을 string으로 좁혀서 if에서 안먹힌다.
    
7. callback
    
    타입 스크립트는 콜백 함수 내에서 type guard가 계속 유효하다고 여기지 않는다.
    
    예를들어 옵셔널로 되어있는 변수는 한번 로컬 변수로 선언해서 타입을 추론할 수 있게 만들고 콜백에 전달한다.
    
8. is
    
    ```tsx
    function isString(test: any): test is string{
        return typeof test === "string";
    }
    ```
    
    리턴 되는 값이 true라면 test를 string으로 타입을 좁힌다.