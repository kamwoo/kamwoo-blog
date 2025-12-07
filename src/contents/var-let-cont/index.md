---
title: var let cont
published: true
category: js
subtitle: JavaScript의 var, let, const의 차이점과 스코프, 호이스팅, TDZ(Temporal Dead Zone)에 대한 설명
date: 2022-04-12
---

## 변수란

> 데이터에 식별자를 명시한것

- 데이터를 일정 기간 동안 저장하여 필요한 때에 다시 사용하기 위해 사용된다.
- 사람이 이해하기 쉽게 어떠한 값의 메모리 주소에 접근하기 위해서 사용한다.
- 식별자에는 변수명, 함수명, 프로퍼티명, 클래스명 등이 있다.

## var, let, const

변수는 `var`, `let`, `const`를 사용해서 선언하고, 값을 할당한다.

### var

ES6 이전까지 `var`를 사용해서 변수를 선언했다. 하지만 `var`의 특징으로 인해서 단점이 있었고 자바스크립트에서 되도록 사용하지 않는 방향으로 가이드하고 있다.

특징

1. 변수 중복 선언 가능
    
    : 의도하지 않은 변수값의 변경이 일어날 가능성이 크다.
    
2. 함수 레벨 스코프
    
    : 함수의 코드 블럭만을 스코프로 인정한다. 함수에서만 지역 스코프를 가진다.
    
    즉 함수 외부에서 선언된 변수는 전역변수가 된다.
    
    이러한 현상은 일반적이라고 생각되는 블럭문안에서 지역변수로 간주되지 않게 되고 혼란을 야기한다.
    
3. 변수 호이스팅
    
    : 변수를 선언하기 이전에 참조할 수 있다.
    

→ 전반적으로 코드가 어떻게 작동될지 예측하기 어려운 경우가 자주 발생한다.

### const, let

- let, const는 함수와 if, for, while, try/catch 등 블록레벨 스코프를 가진다.
    
- let으로 선언하면 초기화할 때 undefined가 들어가고 넘어가지만
    
    const로 선언하면 undefined가 들어가고 초기화 시킬 값이 없으므로 초기값이 없다는 에러가 뜬다.
    

## 예시

```jsx
var a = 10; 
let b = 20; 
const c = 30; 

// 함수 선언문 
function func_1(arg){ return arg; } 

// 함수 표현식(var) 
var func_2 = function(arg){ return arg; } 

// 함수 표현식(const/let) 
const func_3= function(arg){ return arg; }

```

스캔

1. var
    
    컨텍스트에 var a 식별자를 저장하면서 바로 콜스택 메모리에 undefined를 할당한다.
    
    그래서 var a 선언문 전에 콘솔을 찍으면, 값은 undefined로 나오게 된다.
    
2. let, const
    
    컨텍스트에 let b, const c 식별자를 저장만 한다.
    
    그래서 선언문 전에 콘솔을 찍으면, reference error가 발생한다.
    
3. function
    
    - 함수 선언문
        
        1. 컨텍스트에 func_1 식별자를 저장한다.
        2. 힙에 메모리 공간을 확보한다.
        3. 콜스택에 힙 메모리 공간 주소를 할당한다.
        4. func_1 식별자에 콜스택 메모리 주소를 저장한다.
        5. 힙 메모리 공간에 함수 내용을 저장한다.
        
        그래서 함수 선언문 앞에서도 호출을 할 수 있다.
        
    - 함수 표현식
        
        변수로 선언한 것과 동일한 과정을 가진다.
        

실행

1. var
    
    var a = 10에 콜스택에 메모리 공간을 확보하여 10을 저장하고, 주소를 새로 저장한다.
    
2. let, const
    
    let b = 20, const c = 30을 만나면 undefined를 할당하고 메모리 공간을 확보해서 20, 30을 할당하여 주소를 저장한다.
    
3. function
    
    - 함수 선언문
        
        이미 스캔과정에서 메모리 할당까지 되었다.
        
    - 함수 표현식
        
        변수와 동일하다.
        

### TDZ

> Temporal Dead Zone

식별자에 값을 할당하기 이전까지 사용할 수 없는 구역을 의미한다.

위 예시에서 var는 스캔하는 과정에서 undefined를 할당하지만 let, const는 식별자만을 컨텍스트에 추가하기 때문에 reference에러가 발생한다.

아래의 그림을 보면 쉽게 이해할 수 있다.

<img src="/images/posts/var-let-cont/1.png" />

출처: [https://dmitripavlutin.com/javascript-variables-and-temporal-dead-zone/](https://dmitripavlutin.com/javascript-variables-and-temporal-dead-zone/)