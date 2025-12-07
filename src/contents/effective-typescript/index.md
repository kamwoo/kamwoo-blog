---
title: Effective typescript
published: true
category: typescript
subtitle: TypeScript 컴파일러의 역할과 타입 선언, 타입 단언, 잉여 속성 체크, type과 interface의 차이점에 대한 가이드
date: 2022-09-14
---

### 타입스크립트 컴파일러 역할

1. 최신 자스/타스를 브라우저에서 동작할 수 있도록 구버전의 자스로 트랜스 파일한다.
2. 코드의 타입 오류를 체크한다.

- 타입 오류가 있는 코드도 컴파일이 가능하다.
  컴파일은 타입체크와 독립적으로 동작한다.
- 런타임에는 타입 체크가 불가능하다.
  자바스크립트로 컴파일되는 과정에서 타입을 다 없어진다.
- 런타임 타입은 선언된 타입과 다를 수 있다.
  선언된 타입이 언제든지 달라질 수 있으므로 타입이 달라지는 혼란스러운 상황을 가능한 피해야 한다.

### 타입 단언보다 타입 선언을 사용해야 한다.

타입 선언은 할당되는 값이 해당 인터페이스를 만족하는지 검사한다.

```tsx
const people = ['alice', 'bobo', 'jane'].map((name):Person => ({name}))

// 위 콜백으로 리턴되는 값이 Person 타입임을 명시
(name):Person => ({name})

// 인자인 name이 Person 타입임을 명시
(name: Person) => ({name})

```

타입 단언이 필요한 경우

- 타입스크립트가 타입을 알 수 없을 때
- 타입스크립트보다 타입 정보를 더 잘 알 때
- DOM에 접근 하지 못하기 때문에
  ```tsx
  const button = event.currentTarget as HTMLButtonElement;
  ```

서브 타입이 아니면 타입 단언을 사용할 수 없다.

예를 들어 HTMLElement as Person은 서로 서브 타입이 아니기 때문에 타입 단언을 사용할 수 없다.

오류를 해결하기 위해서는 as unknown을 사용해야 한다.

모든 타입은 unknown에 서브 타입이기 때문에 HTMLElement as unknown as Person은 가능하다.

### non-null assertion

- null이 아니라고 확신할 때
- 아니면 조건문으로 null이 나올 수 없는 경우를 만들어 줘야한다.

### `잉여 속성 체크`는 `할당 가능 검사` 와는 별도의 과정이다.

```tsx
interface Room {
  numDoors: number;
  ceilingHeight: number;
}

const r: Room = {
  numDoors: 1,
  ceilingHeight: 100,
  elephant: 'pre', // 오류
};

const obj = {
  numDoors: 1,
  ceilingHeight: 100,
  elephant: 'pre',
};

const r: Room = obj; // 정상
```

객체 리터럴을 변수에 할당하거나 함수에 매개변수로 전달할 때 잉여 속성 체크가 수행된다.

임시변수를 쓰면 잉여속성 체크를 건너뛸 수 있다.

### 타입스크립트에서는 함수 표현식을 사용하는 것이 좋다.

⇒ 함수의 매개변수부터 반환값까지 전체를 함수 타입으로 선언해서 사용할 수 있다.

다른 함수의 시그니처를 참조하려면 typeof fn을 사용하면 된다. 예) typeof fetch

### type과 interface 차이

type은 유니온이 될 수 있고, 매핑된 타입, 조건부 타입으로 사용할 수 있다.

interface는 성언 병합을 할 수 있다.

```tsx
interface State {
  name: string;
  capital: string;
}

interface State {
  age: number;
}

const a: State = {
  name: 'kam',
  capital: 'W',
  age: 29,
};
```

- 복잡한 타입이라면 type을 사용한다.
- 간단한 객체로 일관성이나 보강 가능성이 있다면 interface를 사용한다.
- api에 대한 타입을 선언한다면 api가 변경될 때 사용자가 interface를 통해 새로운 필드를 병합할 수 있으므로 interface가 유용하다.
  하지만, 프로젝트 내부에서 사용되는 타입은 병합이 발생하면 안되기 때문에 type을 사용한다.
