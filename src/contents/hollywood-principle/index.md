---
title: Hollywood principle
published: true
category: js
subtitle: 헐리웃 원칙을 통한 고수준-저수준 구성요소 간 단방향 의존성 관리와 이벤트 처리
date: 2022-02-22
---

# 헐리웃 원칙

"전화하지 마세요. 우리가 연락할게요(Don't call us, we'll call you).”

고수준 구성요소에서 저수준 구성요소에게 요청을 하지 반대로는 안되게 하는 것

예를 들어 버튼에 이벤트 콜백함수를 부착할 때

view.js

```jsx
setOnSubmitName(fn) {
    this.$nameButton.addEventListener('click', (event) => {
      event.preventDefault();
      fn(this.$nameInput.value);
    });
  }
```

controller.js

```jsx
this.view.setOnSubmitName(this.onSubmitName.bind(this));

onSubmitName(carNames){}
```

자바스크립트의 함수가 일급객체이기 때문에 가능하고,

고수준의 구성요소와 저수준의 구성요소가 양방향 커뮤니케니션하지 않도록, (의존성 부패)가 되지 않도록 한다.

이벤트를 단방향으로 전달할 수 있게 한다.

결국 “구성요소 간의 의존을 복잡하지 않게 한다”는 것이 중요하다.

bind.(this)를 하는 이유로는 setOnSubmitName에서는 this.가 view가 되기 때문에, controller의 this라는 것을 넘겨줌으로 addEventListener안에서 this는 controller가 된다.