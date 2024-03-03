---
title: Closure
published: true
category: js
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-05-06
---

>값 캡처

함수가 생성될 때의 스코프를 활용하는 방법이고, 함수에서 함수를 리턴한다고 했을 때 상위 함수의 외부에서 내부 함수를 호출하더라도 상위 함수의 지역에 접근할 수 있는 함수를 클로저라고 한다.

외부함수가 실행 컨텍스트로 콜 스택에 올라가고 실행되고 Life Cycle이 종료되더라고 내부 함수에 의해서 참조되고 있다면 외부 함수 실행 컨텍스트 안에 활성 객체(내부 변수, 함수 등등이 저장되는 객체)는 유지되어서 내부 함수에서 스코프 체이닝으로 접근할 수 있다.

함수와 함수의 Lexical scope를 이용해 조합하는 것, 내부 함수

```jsx
function init(){
	let name = "kam"
	function showName(){
		console.log(name)
	}
	showName()
}
init()
```

showName은 init에서만 사용할 수 있다.

```jsx
function makeFunc() {
	let name = "kam"
	function showName(){
		console.log(name)
	}
	return showName
}

const logKam = makeFunc()
logKam()
```

1. makeFunc함수 실행으로 컨텍스트가 콜스택에 쌓인다.
2. makeFunc를 스캔하고 실행하면서 “kam”이 콜스택 메모리에 저장되고 name에 주소가 저장된다.
3. showName이 스캔되면서 힙, 콜스택에 할당되고 showName에 주소가 저장된다.
4. logKam에 showName이 가르키는 주소를 저장한다.
5. logKam을 실행시키면 저장된 주소를 통해 메모리에 접근하여 저장된 showName 내부 소스가 실행된다.
6. showName 내부의 name을 찾기 위해 컨텍스트에 outenviromentReference를 따라 name을 찾는다.
7. name = “kam”을 찾아 log를 찍는다.

자바스크립트는 함수를 리턴하면 리턴하는 함수가 클로저를 형성한다.

클로저가 생성된 시점의 유효한 범위 내에 있는 모든 지역 변수로 구성된다.

```jsx
function makeAdder(x){
	let y = 1
	return function(z){
		return x + y+ z
	}
}

const add5 = makeAdder(5)

console.log(add5(4)) // 10
```

makeAdder는 함수를 만들어내는 공장으로 볼 수 있다.

개인적인 생각: 2번 꺽어서 동작하게 만드므로 다양한 경우를 커버할 수 있다.

```jsx
function makeSizer(size){
	return function(){
		document.body.style.fontSize = size + 'px'
	}
}

const size12 = makeSizer(12)

document.getElementById('size-12').onclick = size12
```

클릭시 실행될 함수를 전달해야할 때 사용할 수 있다.

클로저를 이용해서 private함수를 만들 수 있다.

모듈 패턴

```jsx
const makeCounter = function(){
	let privateCount = 0;

	function changeBy(value){
		privateCount += value
	}

	return {
		increment: function(){
			changeBy(1)
		},
		decrement: function(){
			changeBy(-1)
		},
		value: function(){
			return privateCount
		}
	}
}()

const counter1 = makeCounter()
counter1.value() // 0
counter1.increment()
counter1.value() // 1
counter1.decrement() 
counter1.value() // 0
```

count에 리턴 값으로 숫자에 대한 메소드들이 담긴 객체에 참조가 들어간다.

객체는 생성되었던 환경의 스코프를 저장하고 있고, 변수나 함수가 사용될 때 스코프를 찾아 올라간다.

클로저 스코프 체인

- 지역 범위
- 외부 함수 범위
- 전역 범위

겹치는 함수 범위에서는 공통으로 클로저가 접근한다.

```jsx
function showHelp(help) {
  document.getElementById('help').innerHTML = help;
}

function makeHelpCallback(help) {
  return function() {
    showHelp(help);
  };
}

function setupHelp() {
  var helpText = [
      {'id': 'email', 'help': 'Your e-mail address'},
      {'id': 'name', 'help': 'Your full name'},
      {'id': 'age', 'help': 'Your age (you must be over 16)'}
    ];
	// 이 부분
  for (var i = 0; i < helpText.length; i++) {
    var item = helpText[i];
    document.getElementById(item.id).onfocus = makeHelpCallback(item.help);
  }
}

 setupHelp();
```

여기서 var item을 하면 사실상 주석한 부분에 item이 선언된 것과 같기 때문에

나중에 onfocus에서 콜백 클로저를 접근할 때 모든 클로저가 스코프를 타고 올라가서 보면 item = helpText[2]가 된다.

그래서 var 대신 let을 쓰면 블록 스코프로 적용되므로 원하는대로 사용할 수 있고, 아니면 helpText을 바로 사용하는 방법도 있다.

보조 함수 예제

```jsx
const makeCounter(predicate){
	let count = 0
	return function(){
		count += predicate(count)
		return count
	}
}

function increase(n){
	return n += 1
}

function decrease(n){
	return n -= 1
}

const increaser = makeCounter(increase)
increaser()
const decreaser = makeCounter(decrease)
decreaser()
```

필요성이 사라진 경우에는 식별자에 undefined, null을 할당하면 GC가 수거한다.

네트워트 요청 데이터 캐싱과 같이 자유변수의 참조값을 캐싱하고자 할 때 많이 쓰인다.