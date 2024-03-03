---
title: Shallow copy - Deep copy
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-05-16
---

## 의미

**얕은 복사**란 원래값과 복사값이 같은 메모리 주소를 참조하고 있는 것을 말한다.

**깊은 복사**란 원래값과 복사값의 다른 메모리 주소를 찾조하는 것을 말하고 관계가 완전히 끊어진 상태이다.

얕은 복사일 경우일 경우에 복사값을 변경한다만 원본값도 변경이 일어나게 되고, 깊은 복사는 서로 영향을 주지 않는다.

## 설명

**원시값**

Number, String, Boolean, Null, Undefined, Symbol이 있다.

원시값은 복사할 때 복사된 값을 다른 메모리에 할당하기 때문에 서로 영향을 주지 않는다.

```jsx
const a = 1
let b = a

a = 2

console.log(a) // 2
console.log(b) // 1
```

위 예제를 순서대로 설명하면

- b는 a가 참조하는 `1`의 주소를 가르킨다.
- a는 새롭게 할당된 `2` 의 주소를 저장한다.
- b는 여전히 `1` 의 주소를 가르킨다.

메모리 영역에서 값을 변경하지 않고, 새로운 값을 메모리에 할당해서 변수가 가르키는 주소를 변경한다.

이와같이 메모리 영역에서 값을 변경할 수 없는 것을 불변성이라고 한다.

**참조값**

원시값을 제외한 나머지 자료형을 말하고 Object, Array 등의 있다.

원시값을 제외한 나머지 값은 객체 타입이다.

참조값은 객체의 주소를 할당하기 때문에 완전히 같은 것이 된다.

```jsx
const a = {number: 1}
let b = a

b.number = 2

console.log(a.number) // 2
console.log(b.number) // 2
```

위 예제를 순서대로 설명하면

- `{number: 1}` 을 heap 메모리 영역에 할당한다.
- `{number: 1}` 의 메모리 주소를 가르키는 참조값이 콜스택 메모리 영역에 할당된다.
- a에 콜스택 메모리 영역에 해당 주소를 가르키는 참조값을 저장한다.
- b에 a가 가르키는 참조값이 저장된다.
- `b.number` 를 통해 값을 변경할 경우 heap에 저장된 해당 객체의 속성을 변경시킨다.

결과적으로는 a와 b는 같은 주소를 가르키고 있기 때문에 해당하는 객체를 변경시키면 a와 b 둘 다 변경된다.

### 얕은 복사

복사된 값과 원본의 값이 서로 같은 참조를 하는 것을 말한다.

객체 안에 객체 중 한개라고 원본 객체를 참조하면 얕은 복사된 객체라고 할 수 있다.

객체 타입을 복사할 경우 얕은 복사가 일어난다.

이러한 상황은 언제든지 상태가 변경될 수 있기 때문에 원하지 않는 사이드 이펙트가 발생한 확률이 커진다. 문제를 피하기 위해서 방어적 복사와 불변 객체로 변경하는 방법이 있다.

1. Object.assign(target, …sources)

방어적으로 객체를 복사하는 방법으로 사용할 수 있다.

열거 가능한 속성만을 타겟 객체로 복사한다.

따라서 객체 내부의 객체는 얕은 복사가 된다. (1 depth만 깊은 복사)

```jsx
const a = {x:1};
const b = a
const c = Object.assign({}, a)

console.log(a === b) // true
console.log(a === c) // false
```

```jsx
const obj = {
	a: 1,
	b: {
		c: 2
	}
}

const copieObj = Object.assign({}, obj)
copieObj.b.c = 3

console.log(obj === copieObj) //false
console.log(obj.b.c === copieObj.b.c) //true
```

사용 예시

```jsx
const form = { 
	firstName: null, 
	lastName: null, 
	Email: null, 
	zipCode: null, 
	Address: null, 
	Phone: null } 

const input = { 
	firstName: 'John', 
	lastName: 'Doe', 
	Email: 'john@example.com' 
} 

Object.assign(form, input) 

console.log(form)
//출력값
{ 
	firstName: 'John', 
	lastName: 'Doe', 
	Email: 'john@example.com', 
	zipCode: null, 
	Address: null, 
	Phone: null 
}
```

같은 키는 덮어쓰기 된다. 예시를 보면 두 객체를 병합해서 새로운 객체를 생성한다는 것을 알 수 있다.

1. 전개 연산자

해당 객체가 소유한 프로퍼티를 새로운 객체로 복사한다.

대부분 `Object.assign()` 과 동일한 결과를 얻을 수 있고, 보다 더 짧은 문법으로 사용가능하다.

```jsx
const obj = {
  a: 1,
  b: {
    c: 2,
  },
};

const copiedObj = {...obj}

copiedObj.b.c = 3

obj === copiedObj // false
obj.b.c === copiedObj.b.c // true
```

### 깊은 복사

> 원본값과 복사값이 다른 메모리 주소를 참조하는 것

1. 재귀를 이용하여 새로 객체 생성

```jsx
const obj = {
  a: 1,
  b: {
    c: 2,
  },
};

function copyObj(obj) {
  const result = {};

  for (let key in obj) {
    if (typeof obj[key] === 'object') {
      result[key] = copyObj(obj[key]);
    } else {
      result[key] = obj[key];
    }
  }

  return result;
}

const copiedObj = copyObj(obj);

copiedObj.b.c = 3

obj.b.c === copiedObj.b.c //false
```

1. JSON.stringify()

객체를 json문자열로 변환하면서 참조가 모두 끊어진다.

json문자열을 다시 JSON.parse()로 객체로 만들어주면 깊은 복사가 된다.

- 단점: 느림

1. lodash 라이브러리 사용