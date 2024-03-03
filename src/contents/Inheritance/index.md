---
title: Inheritance
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-06-02
---

# 상속

부모 클래스 상속, 추상화

- 자바스크립트는 프로토타입의 언어이다.
- 자바스크립트에 메소드라는 것은 없다. 객체의 속성으로 함수를 지정할 수 있고 속성값을 사용하는 방식으로 쓴다.
- 자바스크립트의 함수는 항상 프로토타입을 가지고 있다.
- 브라우저가 인스턴스에 접근할 때 프로퍼티를 확이하고 없으면 프로토타입 없으면 프로토타입에 프로퍼티 이런식으로 탐색한다.
- 모든 함수의 마지막 프로토타입은 window.Object.prototype이고 이것의 프로토타입의 null이므로 탐색이 종료된다.

객체생성

리스트, 함수도 객체이다.

- 객체
    
    var o = {a:1}
    
    o객체는 Object.prototype을 가진다.
    
    o → Object.prototype → null
    
- 리스트
    
    var a = [”k”,”a”,”m”]
    
    Array.prototype을 상속받는다.
    
    a → Array.prototype → Object.prototype → null
    
- 함수
    
    fuction f(){ return 2}
    
    Function.prototype을 상속받는다.
    
    f → Fuction.prototype → Object.prototype → null
    

상속받는 메소드

1. var a = {a:1} // a → Object.prototype → null
2. var b = Object.create(a) // b → a → Object.prototype → null

### 하지만!!! prototype을 사용하지는 마라!

이 방법은 몽키 패칭으로 불리며 캡슐화를 망가뜨린다.

프로토타입 상속의 종류

- 위임형 상속
    
    프로토타입 객체가 다른 객체의 기반이 된다. 새 객체는 상속된 객체의 참조를 가진다.
    
    장점: 모든 객체가 각 메소드에 대해 하나의 코드를 공유하므로 메모리를 절약할 수 있다.
    
    단점: 상태를 저장하는데 좋은 방법이 아니다. 상태를 변경하면 공유하는 모든 객체의 상태가 변경된다.
    
    상태변경이 전파되는 것을 막을려면 상태값의 복사본을 만들어야 한다.
    
    ```jsx
    class Geeter{
    	constructor(){
    	this.name = name || 'john'
    	}
    
    	hello(){
    		return `hello ${this.name}`
    	}
    }
    
    const george = new Geeter('george')
    ```
    
- 연결형 상속
    
    객체의 속성을 다른 객체에 모두 복사함으로써 상속을 구현하는 방법
    
    매우 좋은 방법으로 클로저와 같이 사용하면 훨씬 효과적이다.
    
    ```jsx
    const proto = {
    	hello: function hello(){
    		return `hello ${this.name}`
    	}
    }
    
    const george = Object.assign({}, proto, {name: 'george'})
    ```
    
- 함수형 상속
    
    새 속성들을 연결형 상속으로 쌓되 상속 기능을 Factory 함수로 만들어 사용하는 방식
    
    기존의 객체를 확장하는데 쓰이는 함수를 Mixin함수라고 한다.
    
    장점: private data를 클로저를 통해 캡슐화 시킬 수 있다. 다르게 말해서 private상태를 지정할 수 있다.