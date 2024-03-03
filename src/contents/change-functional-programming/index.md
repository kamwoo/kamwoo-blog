---
title: functional methods
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-05-29
---

# 함수형으로 전환

### 다형성

함수형 프로그래밍은 함수 ⇒ 데이터 이다.

array like 메소드와 같은 것들을 커버할 수 있고, 인자로 전달되는 predi, iter, mapper와 같은 함수들을 이용하여 확장성을 높일 수 있다.

```tsx
function _filter(list, predi) {
  let new_list = [];
  _each(list, (val) => {
    if (predi(val)) new_list.push(val);
  });
  return new_list;
}

function _map(list, mapper) {
  let new_list = [];
  _each(list, (val) => new_list.push(mapper(val)));
  return new_list;
}

function _each(list, iter) {
  for (let i = 0; i < list.length; i++) {
    iter(list[i]);
  }
}
```

### 커링

```tsx
function _curry(fn) {
  return function (a, b) {
    return arguments.length === 2
      ? fn(a, b)
      : function (b) {
          return fn(a, b);
        };
  };
}

const add = _curry((a, b) => a + b);
const add10 = add(10);
console.log(add10(5));
console.log(add(10, 5));

function _curryr(fn) {
  return function (a, b) {
    return arguments.length === 2
      ? fn(a, b)
      : function (b) {
          return fn(b, a);
        };
  };
}

const sub = _curryr((a, b) => a - b);
console.log(sub(10, 5));

const sub10 = sub(10);
console.log(sub10(5));
```

### get

```tsx
const _get = _curryr((obj, key) => obj && obj[key]);

const user1 = users[0];
console.log(_get(user1, 'name'));

const get_name = _get('name');
console.log(get_name(user1));

console.log(
  _map(
    _filter(users, (user) => user.age > 30),
    _get('name')
  )
);
```

_curryr로 name 키값을 찾는 메소드를 생성할 수 있다.