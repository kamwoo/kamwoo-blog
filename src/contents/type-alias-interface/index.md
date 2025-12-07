---
title: type alias vs interface
published: true
category: typescript
subtitle: Type alias와 interface의 차이점과 각각의 사용 시나리오에 대한 비교 분석
date: 2022-08-06
---

차이점

- interface는 객체만 타입으로 설정할 수 있는 반면에 type alias는 객체와 원시타입을 선언할 수 있다.
- interface는 선언 병합이 되지만 type alias는 되지 않는다.

사용성

- 확장이 가능하게 만들려면 interface를 사용할 수 있고, 불가능하게 만들려면 type alias를 사용할 수 있다.

1. 선언병합의 가능, 불가능
2. 원시 타입에 선언가능, 불가능
3. 유니온, extends -> extends를 통해서 확장했으므로 상위 타입을 온전히 사용하라는 의미로 협업에 도움을 줄 수 있다.
4. interface는 명세적인 성격이 강하고, type alias는 타입의 모음에 성격이 강하다
5. type alias는 복잡하거나, 튜플일 경우에 사용하면 편하다.