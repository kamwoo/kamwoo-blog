---
title: Infer
published: true
category: typescript
subtitle: TypeScript의 infer 키워드를 사용한 조건부 타입에서 타입 추론하는 방법
date: 2022-08-03
---


> 조건문에 쓰이는 타입 중 하나를 이름을 붙여서 빼가지고 삼항에 사용하기 위해서 사용한다.

### 예제

```tsx
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any
```

**좌항**

```tsx
type ReturnType<T extends (...args: any) => any>
```

`ReturnType` 에 제네릭으로 전달한 타입 `T` 를 `(...args: any) => any` 타입의 이하로 제한해서 받아온다.

**우항**

```tsx
T extends (...args: any) => infer R ? R : any
```

함수 타입의 `T` 의 반환값을 `R` 로 이름을 붙여서 삼항에서 사용하기 위해서 infer를 사용했다.

`extends` 는 `T` 의 반환값을 `R` 로 명시하기 위해서 사용하것에 불과하다.

`T` 가 있으면 `R` 을 반환하고 아니면 any를 반환한다.