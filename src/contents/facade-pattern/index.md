---
title: Facade Pattern
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-03-03
---

전자레인지에 on/off 버튼

on 버튼을 누른다 →( 쿨러 작동 → 마이크로파 작동 → 턴테이블 작동 → 타이머 작동)

이러한 일련의 과정을 client에게 시킬 필요도, 보여줄 필요도 없으므로 중간자에서 응집시켜 관리하며,

client는 on만으로도 작동 시킬 수 있다.

<div align="center">
<img src="/images/posts/facade-pattern/1.png" />
</div>

기능을 편하게 사용할 수 있는 인터페이스를 제공한다는 목적이 있다.

퍼사드 클래스가 서브시스템 클래스들을 캡술화 하는 것은 아닙니다. 다만 기능을 편하게 사용할 수 있도록 인터페이스를 제공해 줄 뿐이죠.

최소 지식 원칙 (데메테르의 원칙, Law of Demeter) : 정말 관련있는 객체와만 관계를 맺어라!

- **객체자체**
- **메소드에 매개변수로 전달된 객체**
- **그 메소드에서 생성하거나 인스턴스를 만든 객체**
- **그 객체에 속하는 구성요소**

이 종류의 메소드만을 호출하면 이 원칙을 지킬 수 있다.