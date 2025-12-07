---
title: typeof - instanceof
published: true
category: js
subtitle: typeof와 instanceof 연산자의 동작 원리와 typeof null이 object를 반환하는 이유
date: 2022-05-28
---

```
typeof operand
typeof(operand)
```

피연산자의 데이터형을 알 수 있다.

typeof의 반환값

- “undefined”
- “object”
- “boolean”
- “number”
- “string”
- “function”
- “symbol”

## instanceof

object의 prototype chain에 constructor.prototype이 존재하는지 판별한다.

`식별자 instanceof 피연산자` 로 사용하며 피연사자가 함수가 아닐 경우 TypeError가 발생한다. 우변의 생성자 함수에 prototype에 바인딩된 객체가 좌변의 프로토타입 체인 상에 존재한다면 true로 평가된다.

```jsx
function Car(make, model, year) {
  this.make = make;
  this.model = model;
  this.year = year;
}
const auto = new Car('Honda', 'Accord', 1998);

console.log(auto instanceof Car);
// expected output: true

console.log(auto instanceof Object);
// expected output: true
```

## typeof null

null은 값이 의도적으로 비어있다는 것을 명시하기 위해서 사용한다. null값으로 할당되어있는 메모리는 GC에 의해서 해제된다.

null에 대한 재밌는 얘기가 있다. null은 primitive data로 원시값이다. 하지만 typeof null을 하면 object가 나온다. 왜 이럴까?

이것은 자바스크립트 초창기부터 있었던 버그다!

typeof의 동작과정은 다음과 같다.

```tsx
if(is_undefined?){  // undefined 체크
	return undefined;   
    
}else if(is_object?){  // object 체크

	if(is_function?){  // function 체크
		return function;
        
	}else{
		return object;
	}
    
}else if(is_number?){  // number 체크
	return number
    
}else if(is_string?){  // string 체크
	return string
    
}else if(is_boolean?){  // boolean 체크
	return boolean
}
```

### null 값을 체크하는 부분이 빠져있다

따라서 Object로 판별된다.

버그인 것을 알면서 고치지 않는 이유는 이미 너무 많은 곳에서 typeof를 사용하고 있기 때문에 고치면 위험하기 때문이다.

따라서 null 값의 타입을 체크하기 위해서는 typeof를 쓰기 보다는 `===` 연산자를 사용해서 null인지 아닌지를 판별하는게 명확하다.