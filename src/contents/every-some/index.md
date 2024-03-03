---
title: Every Some
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-05-11
---

```jsx
const array = [1,2,3,4,5];

const even = (element) => element === 2;

console.log(array.some(even));
//true
console.log(array.every(event));
//false
```

- some
    
    리스트의 요소를 순환하면서 콜백함수가 하나라도 true를 리턴하는 경우 ⇒ true
    
- every
    
    리스트의 요소를 순환하면서 콜백함수의 리턴이 모두 true여야 ⇒ true
    

## 유의점

every에는 공허참이라는 개념이 적용되어 있다. 뜻은 기본적으로 true값을 가진다는 것이다.

> default true → callback fn에서 하나라도 false라면 false로 종료

만약 빈 리스트 `[]`라면 반복문이 실행되지 않고 그대로 종료되면서 true를 리턴하게 된다.

반대로 some은 기본적으로 false값을 가진다.


## 활용 예

vlidate

```jsx
export const validatePurchaseMoney = (value) => {
  if (isZero(value)) {
    throw new Error(ERROR_MESSAGE.ZERO_PURCHASE_MONEY);
  }

  if (isNotNumber(value)) {
    throw new Error(ERROR_MESSAGE.INVALID_PURCHASE_MONEY_TYPE);
  }
  ...
};

---

const purchasedMoneyValidator = [
  { test: isZero, errorMsg: ERROR_MESSAGE.ZERO_PURCHASE_MONEY },
  { test: isNotNumber, errorMsg: ERROR_MESSAGE.INVALID_PURCHASE_MONEY_TYPE },
  ...
]

const validatePurchaseMoney = value => purchasedMoneyValidator.every(({ test, errorMsg }) => {
  if (test(value)) throw new Error(errorMsg);
  return true;
})
```