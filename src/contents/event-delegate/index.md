---
title: event delegate
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-06-05
---

각 노드에 대해 이벤트를 추가하지 않고, 상위 노드에서 하위 노드를 제어하는 방식

<img src="/images/posts/event-delegate/1.png" />

이벤트 버블링이 발생했을 때 최초로 이벤트를 발생시킨 요소이 event.target이 된다.

td안에 strong태그가 중첩되어 있다고 했을 때, td클릭을 기대했지만 strong 태그를 클릭하면 원하는 target이 클릭되지 않을 수 있다. td 안쪽에서 이벤트까지 감지하기 위해서는 closest를 이용한다.

```jsx
table.onclick = function(event) {
  let td = event.target.closest('td'); // (1)

  if (!td) return; // (2)

  if (!table.contains(td)) return; // (3)

  highlight(td); // (4)
};
```

위 코드는 이벤트가 발생한 요소부터 table까지 버블링이 올라가는 중에 가장 가까운 td요소를 찾아 highlight한다.

클릭되는 요소에 dataset을 이용해서 행동 패턴을 사용할 수도 있다.

```jsx
첫 번째 카운터: <input type="button" value="1" data-counter>
두 번째 카운터: <input type="button" value="2" data-counter>

<script>
  document.addEventListener('click', function(event) {

    if (event.target.dataset.counter != undefined) { // 속성이 존재할 경우
      event.target.value++;
    }

  });
</script>
```

반대로 이벤트가 상위 노드에서 하위 노드로 내려올 수 있다.

이벤트는 3단계로 진행된다.

1. 상위 노드에서 하위 노드
2. 타겟에 도달
3. 하위 노드에서 상위 노드

1번의 단계가 기본적으로 false 처리되어 타겟된 요소에서 시작해서 올라온다고 말한다.

```jsx
elem.addEventListener('click', callback, true)
```

3번째 인자로 { capture: true }를 설정하면 캡처링이 된다.

상위 노드에서 이벤트를 부착하고 switch문으로 case 제어 개별 클래스로 만들 수 있다. (안해봄)