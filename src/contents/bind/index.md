---
title: Bind
published: true
category: js
subtitle: 함수에 원하는 this 연결
date: 2022-05-05
---

[**자바스크립트에서 this는 런타임 시에 결정되기 때문에 컨텍스트에 따라 다르다.**](https://www.notion.so/this-3815431bb3b64ca8af72fac47fc183b0?pvs=21)

함수에 원하는 this를 연결해주는 것은 this binding이라고 한다.

- call, apply
    
    함수를 호출하면서 원하는 객체로 this를 바인딩하고, 인자를 전달한다.
    
    ```jsx
    const obj = {name: 'bode'}
    const say = funciton (item){
    	console.log(`${this.name}는 ${item}`)
    }
    
    say.call(obj, "men")
    say.apply(obj, ["men"])
    ```
    
    call과 apply의 차이점은 인자를 전달할 때 apply는 리스트에 담아서 전달한다.
    
- bind
    
    call, apply와 차이점은 함수를 호출하지 않고, binding된 함수를 전달한다.
    
    ```jsx
    const obj = {name: 'bode'}
    const say = funciton (item){
    	console.log(`${this.name}는 ${item}`)
    }
    
    const bode = say.bind(obj)
    bode("men")
    ```