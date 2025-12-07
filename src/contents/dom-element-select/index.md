---
title: DOM element select
published: true
category: js
subtitle: DOM 요소 선택 방법으로 직접 선택(getElementBy, querySelector)과 관계적 선택(parentNode, children 등)
date: 2022-06-06
---

# DOM 요소 접근 방법

## 직접적으로 선택

1. getElementBy
    
    1. Id: 요소의 id로 선택
        
    2. ClassName: 요소의 class명으로 접근
        
    3. Name: 요소의 name으로 접근
        
    4. TagName: html 태그명으로 접근
        
    5. TagNameNS: 주어진 Name Space에 속하는 태그명으로 접근
        
        name space: 구분이 가능하도록 정해놓은 범위
        
2. querySelector
    
    : 인자로 DOMString(css 선택자)를 전달하여 선택
    
    querySelectorAll
    
    : 인자로 전달한 선택자를 모두 찾아 NodeList로 반환한다.
    

DOM 조작은 많은 연산이 필요하기 때문에 가능한 최소화해야한다.

## 관계적으로 선택

1. parentNode
    
2. childNodes
    
    : 자식요소를 NodeList로 반환한다. 주석 등 딱 봐도 안나왔으면 하는거까지 나온다
    
3. children
    
    : 비요소 노드를 제외한 자식요소를 NodeList로 반환
    
4. firstElementChild
    
5. lastElementChild
    
6. closest(selector)
    
    : 자신으로부터 조상 방향으로 탐색하여 일치하는 요소를 반환
    
7. pointLockElement
    
    : 마우스 이벤트를 대상으로 포인터가 잠겨있는 요소 반환
    
8. scrollingElement
    
    : 스크롤 가능한 요소 반환
    
9. pictureInPictureElement
    

이거 말고도 너무 많다..

부모 자식관계를 많이 이용하게 되면 html을 변경했을 때 js 또한 많은 수정을 해야되므로 가능한 피해야한다.

## **[DOM 노드의 생성, 수정, 삭제 기초](https://blogpack.tistory.com/670)**

1. element.insertAdjacentHTML(position, HTML텍스트)
    
    1. ‘beforebegin’: element앞
    2. ‘afterbegin’: element안에 가장 첫번째
    3. ‘beforeend’: element안에 가장 마지막
    4. ‘afterend’: element 뒤에
2. element.insertAdjacentElement(position, element)
    
3. element.inserAdjacentText(position, data)
    
4. element.after(... nodes)
    
    :nodes는 Node 또는 DOMString, Text를 element태그 뒤에 삽입
    
5. element.before(... nodes)
    
    : element태그 앞에 삽입
    
6. element.append(node)
    
    : node는 Node 또는 DomString, elment자식의 마지막 자식 뒤에 추가한다.
    
    Node.appendChild(Node)는 Node객체만 추가할 수 있다.
    
7. element.prepend(node)
    
    : element 첫번째 자식 앞에 삽입
    

### 요소와 일치하는지 확인

Element.matches(SELECTOR)