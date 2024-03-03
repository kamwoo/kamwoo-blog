---
title: typescript generic
published: true
category: typescript
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-07-11
---

# 제네릭

>클래스 또는 함수에서 사용할 타입을 사용할 때 결정하는 기법

1. 클래스
    
    클래스 정의 시 이름 뒤에 `<T>`를 표기한다. T는 관용적 표현
    
    ```tsx
    class Model<T> {
      
      private _data:T[] = [];
      
      constructor(data:T[]=[]) {
        this._data = data;
      }
      
      get data():T[] { 
        return this._data; 
      }
      
      add(item:T):void { 
        this._data.push(item); 
      }
    }
    ```
    
2. 함수
    
    함수 정의 시 이름 뒤에 `<T>`를 표기한다.
    
    ```tsx
    function pushItemArray<T>(arr:T[], item:T):void {
      arr.push(item);
    }
    
    const potatoChip_materials = ['어니언'];
    
    pushItemArray<string>(potatoChip_materials, '사워크림');
    ```
    
3. 함수 + 멀티 타입
    
    ```tsx
    type pairArray = [any, any][]
    
    function pushPairItem<T, M>(arr: pairArray, item: [T, M]):pairArray {
    	arr.push(item)
    	return arr
    }
    ```
    
4. 팩토리 함수 + 멀티 타입
    
    ```tsx
    // 클래스 Model
    class Model {
      constructor(public options:any) {}
    }
    
    // 팩토리 함수
    function create<T, U>( C: {new (U): T}, options: U ):T {
      return new C(options);
    }
    
    // create() 팩토리 함수에 Model, string[] 멀티 타입 설정
    create<Model, string[]>(Model, ['class type']);
    ```
    
5. T는 Model
    
6. U는 string[]
    
7. C는 Model
    
8. {new (U): T}는 Model을 나타낸다.
    
    {new (U): T}는 new (U) ⇒ T로도 쓸 수 있다.
    
    이말은 constructor에 U타입을 넣어서 T 즉 모델을 반환
    
    1. new (U)는 Model 클래스 또는 constructor(U)
    2. 그거의 타입은 Model
9. 타입 변수 상속
    
    기존의 타입을 상속해서 제네릭할 수 있다.
    
    ```tsx
    class Model<T>{
    	constructor(private _data: T[] = []){
    	}
    
    	add(item: T): void {
    		this._data.push(item)
    	}
    }
    
    // Model 초기화 팩토리 함수 
    function initializeModel<T extends Model<U>, U>(C: new () => T, items:U[]): T {
    	const c = new C();
    	items.forEach(item => c.add(item))
    	return c
    }
    
    initializeModel<Model<string>, string>(Model, [’감’, ’우’, ’영’])
    ```
    

### extends

상속 역할

```tsx
function add<T>(a: T, b:T){
	return a + b // T + T는 연산되지 않는다.
}

function add<T extends Number>(a:T, b:T){
	return a + b // 이제 a, b가 Number라는 것을 알 수 있다. Number타입만 들어갈 수 있다.
}
```

제한조건으로 역할

```tsx
function printMessage<T extends string | number>(message: T){
	return message // message의 타입으로 string 또는 number만 들어갈 수 있다.
}
```

### keyof

```tsx
function getItem<T, K extends keyof T>(object: T, key: K){
	return object[key]
}
// key의 타입을 object에 속성값으로 제한할 수 있다.
```