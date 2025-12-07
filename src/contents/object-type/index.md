---
title: object type
published: true
category: typescript
subtitle: TypeScript에서 배열을 객체로 변환하고 mapped type과 Record utility type을 활용하는 방법
date: 2022-07-29
---

# 객체 설정

> 타스에서 객체 → interface

### Array에서 객체로 변경

```tsx
const CARD_NUMBER_INPUT_NAMES = ['first', 'second', 'third', 'four'] as const;
// *1

type Numbers = typeof CARD_NUMBER_INPUT_NAMES[number]
// *2
```

*1 : const는 literal 그 자체를 타입으로 지정한다. const a = 1에서 a의 타입은 1 그 자체가 되고 1이외에 다른 값이 들어갈 수 없다. const의 특성을 잘살린 타입추론

*2: Array타입을 union 타입으로 변환한다. 번호가 매겨진 index에 해당하는 값들을 가져오기 때문에 number를 사용한다.

### mapping

```tsx
type Number = {
  [K in typeof CARD_NUMBER_INPUT_NAMES[number]]: string;
  // [ ]: type  -> mapped type
  // K(아무 문자) in union type
};

// Record utility type
type Number3 = Record<typeof CARD_NUMBER_INPUT_NAMES[number], string>;

// 똑같은거다.
interface Number2 {
  first: number;
  second: number;
  third: number;
  fourth: number;
}
```

mapped type은 interface로 안된다. type에서만 가능하다.

### generic

```tsx
type Field<T extends string> = {
  [K in T]: string;
};

type ExpiredDate = Field<typeof EXPIRED_DATE_INPUT_NAMES[number]>;
```