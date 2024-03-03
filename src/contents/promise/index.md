---
title: promise-fetch
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-05-22
---
> 자바스크립트 비동기 처리에 사용되는 객체

<aside> 💡 비동기 처리란?

특정 코드의 실행이 완료될 때까지 기다리지 않고 다음 코드를 먼저 수행하는 동작

</aside>

## 문제 해결

하나의 예로 API로 데이터를 받아올 때 아직 수신받지 않은 데이터를 보여주려고 하면 오류나 빈화면이 뜬다.

비동기 예

1. 함수앞에 async를 붙이면 Promise객체가 리턴된다.
2. fetch를 실행하면 Promise<response>가 리턴된다.

이러한 비동기 작업은 Promise객체로 작업이 진행된다.

Promise는 Pending(대기), fulfilled(이행), rejected(실패)의 3가지 상태를 가진다.

처음 Promise객체가 초기화되었을 때 Pending 상태

resolve(response)가 실행되었을 때 fulfilled 상태

rejected(error)가 실행되었을 때 rejected 상태

```tsx
async fucntion request(){
	const response = await fetch('https://...')
}
```

위의 예로 보았을 때

fetch 실행되고 resolve가 실행되기 전까지 pending

서버로 데이터를 받아서 resolve(response)가 실행되면 fulfilled 상태가 되고

실패시 rejected(error)를 실행하여 rejected상태가 된다.

*await는 내부적으로 .then()을 실행시키며 then은 resolve를 받아 데이터를 사용한다.

### async/await 예제

async는 Promise를 반환한다. await는 프로미스가 처리될 때까지 기다린다.

- 코드를 동기적으로 실행하는 것처럼 해서 직관적이다.
- 프로미스를 await할 동안 스레드는 다른 일을 처리하기 때문에 리소스를 낭비하지 않는다.

```tsx
async function foo() {
    return 1
}

---

function foo() {
    return Promise.resolve(1)
}
```

```tsx
async function foo() {
    await 1
}

---

function foo() {
    return Promise.resolve(1).then(() => undefined)
}
```

### fetch

`fetch()`가 반환하는 프로미스 객체는 404, 500과 같은 **HTTP 오류 상태를 수신해도 거부되지 않는다.**  `fetch()`의 프로미스는 서버에서 헤더를 포함한 응답을 받는 순간 정상적으로 이행합니다. 대신, 응답의 상태가 200-299를 벗어날 경우 `[ok`]([https://developer.mozilla.org/en-US/docs/Web/API/Response/ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok)) 속성이 `false`로 설정됩니다. 프로미스가 거부되는 경우는 네트워크 연결이 실패하는 경우를 포함, 아예 요청을 완료하지 못한 경우로 한정됩니다.

fetch가 fullfilled되었다면 Response 객체를 반환한다.
