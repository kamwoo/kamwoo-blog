---
title: Infinite scroll
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-05-21
---

# JS Infinite scroll

### scroll height를 사용

‘scroll‘ 이벤트를 부착하여 스크롤 데이터를 이용하는 방법으로

(height, width), (Top, Left)

**세로 스크롤만 고려(border, padding없음)**

- Element.scrollHeight: 보이지 않는 감춰진 영역까지 포함하여 컨텐츠의 높이
- Element.scrollTop: 스크롤이 아래로 움직임에 따라 위 콘텐츠가 감춰지는 영역의 높이
- Element.offsetHeight: 테두리, 패딩을 포함해서 Element의 높이

scrollHeight - scrollTop과 offsetHeight이 같아지는 시점이 스크롤이 바닥을 찍었을 때이다.

<img src="/images/posts/infinite-scroll/1-1.png" />

추가 api

- clientTop: 스크롤을 가지는 감싸고 있는 요소의 border 두께를 리턴한다.
- clientHeight: border안 영역에 높이, 패팅을 포함하고 스크롤바는 제외한다.

### IntersectionOberser를 사용

해당하는 스크롤 영역에 지정한 타겟이 어느정도 겹치는지 파악한다.

<img src="/images/posts/infinite-scroll/1-2.png" />

```jsx
new IntersectionObserver(callback[, options]);
// 첫번째 인자로 callback을 받고, 두번째 인자로 options를 받는다.

// callback
function callback(entries){
	entries.some(entry => entry.intersectionRatio){
		// 실행되었으면 하는 로직
	}
}

const options = {
	root: // 스크롤 영역이었으면 하는 요소
	rootMargin: // 감지영역 확장, 축소 px
	threshold: // 겹치는 비율 0 ~ 1
}

const intersectionObserver = new IntersectionObserver(callback, options)

intersectionObserver.observe(//타겟이 되어야하는 요소)
```

intersectionRatio: 타겟과 root가 교차되는 부분의 정보

intersectionRect: 타겟과 root가 얼마나 교차되었는지, 0 ~ 1

isIntersecting: 타겟과 root가 교차되었는지, boolean

target: 관찰되고 있는 타겟 요소를 반환

time: 교차가 일어난 시간