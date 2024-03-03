---
title: object pool
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-03-15
---


_정적 메모리 JavaScript_ 는 애플리케이션의 시작 시점에 실행하는 동안에 필요한 모든 메모리를 [사전할당(pre-allocating)](http://en.wikipedia.org/wiki/Sawtooth_wave) 하고 객체가 더 이상 필요없어지면 실행 중에 메모리를 관리하는 테크닉

재사용 가능한 객체들을 모아놓은 객체 풀 클래스를 정의하는 것

- 객체를 빈번하게 생성/삭제 할 때
- 객체들의 크기가 비슷할 때
- 객체를 힙에 생성하기엔 느리거나 메모리 단편화가 우려될 때
- 객체 생성비용이 비쌀 경우 미리 생성해두고 재사용할 필요가 있을 때

GC(garbage collection)이 사용하지 않는 메모리를 해제하러 다니면서 프로그램 속도가 느려진다.

객체 풀을 사용함으로써 GC대상에 포함되지 않아 성능을 높일 수 있다.

### 동작 방법

코드를 작성하다가 새로운 객체가 필요하면 heap에 할당하는 대신에, pool에 있는 사용하지 않는 객체 중 하나를 재사용한다.

수행이 끝나면 메모리에서 객체를 해제하지 않고, pool로 반환한다.

1. 풀은 초기화될 때 사용할 객체들을 미리 생성해서 배열에 넣어두고 사용안함 상태로 초기화한다.
2. 새로운 객체가 필요하면 풀에 요청한다.
3. 풀은 사용 가능한 객체를 찾아 사용 중으로 초기화 한뒤 리턴한다.
4. 객체를 더 이상 사용하지 않는다면 사용 안함 상태로 되돌린다.

```jsx
class *{
	maxPoolSize
  pool에 넣을 객체
  pool = [ ]

  init pool에 maxSize만큼 사용안함의 상태로 객체를 넣는다.

  객체가 있는지 validate

  사용함 상태로 변경 후 반환
}
```