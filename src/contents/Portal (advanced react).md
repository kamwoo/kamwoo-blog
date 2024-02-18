---
title: Portal (advanced react)
date: 2024-02-14
published: true
category: react
subtitle: A set of two-state buttons that can be toggled on or off
---

## Keyword

---

- Stacking Context(쌓임 맥락)
- React Portal

## Contents

---

### 쌓임 맥락

---

3차원 개념화를 추가하기 위해서 Z축을 사용하는 방식이다. 각각의 DOM Element는 css 우선순위를 사용해서 3차원 공간을 차지한다.

**규칙**

---

- 쌓임 맥락 안의 자식요소는 쌓임 맥락 규칙과 동일하게 쌓인다.
- 자식의 z-index는 부모 요소에게만 의미가 있다.
- 쌓임 맥락은 다른 쌓임 맥락을 포함할 수 있고, 계층 구조를 이룬다.
- 형제 쌓임 맥락과 분리된다. 쌓임 맥락은 자손 요소만 고려한다.

ex)

- root
    - DIV #1
    - DIV #2
    - DIV #3
        - DIV #4
        - DIV #5
        - DIV #6

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/f33f1550-130f-4c4d-a8c4-0590640fbf06/2ae1c07c-cde4-4363-ae04-a58ef259c126/Untitled.png)

**쌓임 순서**

---

요소들의 쌓임 순서를 다르게 하기 위해서 두가지 조건이 필요하다.

1. position 변경
2. z-index 설정

**z-index가 없을 경우의 쌓임**

---

순서대로 아래에서 위로 쌓인다.

1. root 요소의 배경과 테두리
2. 자식 요소들은 DOM 순서대로.
3. position이 설정된 자식 요소들은 DOM 순서대로
    - position 속성 값과는 상관 없이 HTML 구조 순서대로 쌓인다.
    - position이 설정되지 않은 요소는 항상 position이 설정된 요소 이전에 렌더링된다.

**z-index 적용할 경우의 쌓임**

---

먼저 요소에 position 속성을 지정하고 z-index를 설정해야한다.

- 같은 z-index를 가진다면 **z-index가 없을 경우의 쌓임**으로 규칙이 적용된다.

### Rules

---

- 쌓임 맥락 안의 자식요소는 쌓임 맥락 규칙과 동일하게 쌓인다.
- 자식의 z-index는 부모 요소에게만 의미가 있다.
- 쌓임 맥락은 다른 쌓임 맥락을 포함할 수 있고, 계층 구조를 이룬다.
- 형제 쌓임 맥락과 분리된다. 쌓임 맥락은 자손 요소만 고려한다.

ex)

- root
    - DIV #1
    - DIV #2
    - DIV #3
        - DIV #4
        - DIV #5
        - DIV #6

![Untitled](https://prod-files-secure.s3.us-west-2.amazonaws.com/f33f1550-130f-4c4d-a8c4-0590640fbf06/2ae1c07c-cde4-4363-ae04-a58ef259c126/Untitled.png)

### 쌓임 순서

---

요소들의 쌓임 순서를 다르게 하기 위해서 두가지 조건이 필요하다.

1. position 변경
2. z-index 설정

**z-index가 없을 경우의 쌓임**

순서대로 아래에서 위로 쌓인다.

1. root 요소의 배경과 테두리
2. 자식 요소들은 DOM 순서대로.
3. position이 설정된 자식 요소들은 DOM 순서대로
    - position 속성 값과는 상관 없이 HTML 구조 순서대로 쌓인다.
    - position이 설정되지 않은 요소는 항상 position이 설정된 요소 이전에 렌더링된다.

**z-index 적용할 경우의 쌓임**

먼저 요소에 position 속성을 지정하고 z-index를 설정해야한다.

- 같은 z-index를 가진다면 **z-index가 없을 경우의 쌓임**으로 규칙이 적용된다.

### Portal

---

React가 Portal로 해결하고자 했던 문제를 아래와 같은 구현 예제로 설명함

- 상단에 sticky한 네비게이션
- 접히는 사이드바
- 모달

![스크린샷 2024-01-18 오전 11.39.27.png](https://prod-files-secure.s3.us-west-2.amazonaws.com/f33f1550-130f-4c4d-a8c4-0590640fbf06/eeb8b935-ed09-4892-9871-c52bc26687d9/%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA_2024-01-18_%E1%84%8B%E1%85%A9%E1%84%8C%E1%85%A5%E1%86%AB_11.39.27.png)

1. 모달을 바닐라 js로 구현할 때, 쌓임 맥락을 피하기 위해서는 아래와 같이 작성할 수 있다.
    
    - body 태그 아래에 추가
        
        ```jsx
        const modalDialog = ... // get the dialog where the button is clicked 
        
        document.getElementByClassName('body')[0].appendChild(modalDialog);
        ```
        
    - 구현 코드
        
        - header - sticky
        - layout
            - sidebar - relative
            - main
                - modal - absolute
        
        ```jsx
        const App = () => {
        	const [isNavExpanded, setIsNavExpanded] = useState(true);
        
        	return (
        		<>
        			<div className="header"></div>
        			<div className="layout">
        				<div
        					className="sidebar"
        					style={{
        	            transform: isNavExpanded
        	              ? 'translate(0, 0)'
        	              : 'translate(-300px, 0)',
        				}}>
        				...
        				</div>
        				<div
        					className="main"
        					style={{
        						transform: isNavExpanded
        					    ? 'translate(0, 0)'
        					    : 'translate(-300px, 0)',
        					}}
        				>
        					{/*main here*/}
        			  </div>
        		  </div>
        		</> 
        	);
        };
        ```
        
        위 코드에서 header는 sticky에 z-index를 높여주면 원하는대로 상단에 고정되도록 구현할 수 있다.
        
        하지만 모달이 main안에서 context가 존재하기 때문에 sidebar에 움직임에 따라서 shift가 발생할 뿐만 아니라 header에 가려지게된다.
        
        이러한 문제를 해결하기 위해서 모달은 `createPortal` 과 함께 root 요소로 보낸다면 sidebar나 header에 영향없이 가장 상단 레이어에 위치시킬 수 있다. 실제 서비스를 구현하는 과정에서는 쌓임 맥락을 벗어날 수 없을 정도로 컴포넌트가 깊게 위치할 수 있기 때문에 `portal` 을 사용함으로써 간단하게 원하는 레이어에 요소를 위치시킬 수 있다.
        
    
    **Portal 특징?**
    
    DOM 트리가 아니라 React 트리를 따른다.
    
    - portal을 사용하는 컴포넌트의 context를 이용한다. 예를 들어서 main 컴포넌트 내부에서 portal을 사용해서 모달을 띄웠다면, main 컴포넌트가 unmount되면 모달도 없어진다.
    - portal을 사용한 곳에서 event 전파가 발생한다. 모달에서 발생한 click 이벤트를 main 컴포넌트에서 잡을 수 있다.
    
    CSS, Form Submit Event는 안된다.
    
    - 렌더 트리를 생성하면서 DOM 트리의 요소와 CSSOM를 매칭하는 과정을 거치게 되는데, 실제 DOM 트리에서 root에 위치하기 때문에 css적인 요소는 실제 DOM 순서로 생각해야된다.
    - “*submit event is not managed by React"*라고 한다. click 이벤트와 달리 submit 이벤트는 실제 DOM 순서로 생각해야한다.
