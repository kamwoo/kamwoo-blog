---
title: test
date: 2024-02-14
published: true
category: react
subtitle: A set of two-state buttons that can be toggled on or off
---

## Key Point

---

- closure의 동작 방식
- useCallback, React.memo, Ref에서 closure를 사용하는 방식
- ref를 사용해서 cloure trap을 피하는 방법

## Contents

---

### closure

: 실행 컨텍스트가 생성될 때의 스코프를 이용하는 방식

책에서는 예제로 아래와 같이 나온다.

```jsx
const something = (value) => { 
	const inside = () => {
		console.log(value); 
	};

  return inside;
};

---
const first = something('first'); 
const second = something('second');

---
first(); // logs "first" 
second(); // logs "second"
```

- `somthing` 실행 컨텍스트가 콜 스택에 올라가서 실행
- Life Cycle이 종료되더라고 내부 함수에 의해서 참조됨
- 외부 함수 실행 컨텍스트 안에 활성 객체(내부 변수, 함수 등등이 저장되는 객체)는 유지되어서 `inside` 함수에서 스코프 체이닝으로 접근

### stale cloure

```jsx
const cache = {};

const something = (value) => { 
	if (!cache.current) {
		cache.current = () => { 
			console.log(value);
		}; 
	}

  return cache.current;
};

---
const first = something('first'); 
const second = something('second'); 
const third = something('third');

first(); // logs "first" 
second(); // logs "first" 
third(); // logs "first"
```

전역에 선언된 `cache` 객체의 `current` 프로퍼티로 들어간 로깅 함수는 `current` 가 없을 때만 새로 선언되기 때문에 “first”만 나오게 된다.

이러한 동작처럼 처음 생성되었을 시점에 값으로 고정되는 것을 “stale cloure”라고 한다.

### useCallback

useCallback의 인자로 전달된 콜백 또한 stale closure문제가 발생할 수 있다.

```jsx
const Component = () => {
	const [state, setState] = useState(() => {text: 1});

	const onClick = useCallback(() => {
		console.log(state);
	}, []); 
};
```

위 예제에서는 useCallback에서 dependencie가 없기 때문에 메모이징된 콜백으로 `undefined`가 계속 로깅된다.

여기서 state를 객체로 해서 프로퍼티를 console.log로 찍으면 될 거라고 생각이 들었음. 하지만 객체로 사용하더라도 콜백에서 같은 값이 로깅됨

이유

1. useCallback에 전달된 메모이징된 콜백에서 상태를 참조함
2. setState로 상태를 업데이트할 때, 새로운 객체를 생성하여 상태로 저장됨
3. 이전에 상태는 참조되고 있기 때문에 메모리에 남아있음
4. 메모이징된 콜백을 계속 찍어도 이전에 참조하고 있는 상태 객체에서 프로퍼티가 찍힘

### ref

ref로 선언한 함수는 리렌더링에도 최신 상태값을 사용할 수 없다. 때문에 상태 변경에 따른 ref 프로퍼티 업데이트를 해주면 된다.

```jsx
const Component = ({ someProp }) => {
	const ref = useRef(() => {
		console.log(someProp);
		console.log(state); 
	});

	useEffect(() => {
		ref.current = () => {
			console.log(someProp);
			console.log(state); 
		};
  }, [state, someProp]);
};
```

### React.memo

memo는 감싼 컴포넌트의 props의 변경을 레퍼런스 체크를 통해서 확인한다. 때문에 컴포넌트에 내부에 선언된 함수는 리렌더링마다 새로 생성되기 때문에 memo가 쓸모없어 진다.

```jsx
const HeavyComponentMemo = React.memo(HeavyComponent);

const Form = () => {
	const [value, setValue] = useState();

	const onClick = () => {
		console.log(value)
	}

	return ( 
		<>
			<input type="text" value={value} onChange={(e) => setValue(e.target.value)} />
			<HeavyComponentMemo title="Welcome to the form" onClick= {onClick} />
		</> 
	);
}
```

이러한 문제를 해결할 수 없는 방법

1. useCallback
    
    위 예시에서 `onClick` 을 useCallback으로 감싼다면 `HeavyComponentMemo` 는 리렌더링되지 않는다. 하지만 onClick에서 입력값 value를 사용한다면, 입력될 때마다 onClick이 업데이트되고 memo 또한 쓸모없어진다.
    
2. memo 수동 비교
    
    이런 문제를 해결하기 위해서 memo의 두번째 인자를 사용할 수 있다. 두 번째 인자가 `false` 라면 리렌더링한다.
    
    리렌더링 조건으로 전달되는 props에서 원하는 prop만 설정하여 이전 prop과 새로운 prop을 비교한다.
    
    ```jsx
    const HeavyComponentMemo = React.memo( 
    	HeavyComponent,
    	(before, after) => {
    	    return before.onClick === after.onClick;
      },
    );
    ```
    
    이 코드는 굳이 두번째 인자를 사용하지 않아도 기본 동작과 같기 때문에 문제를 해결할 수 없다.
    

**Ref를 사용해서 closure trap 피하기**

memo를 사용해서 리렌더링을 피하면서 onClick으로 새로운 값을 사용할 수 있는 방법은 아래와 같다.

```jsx
const Form = () => {
	const [value, setValue] = useState(); 
	const ref = useRef();

	ref.current = () => {
		console.log(value); 
	};

	const onClick = useCallback(() => {
	    ref.current?.();
	  }, []);
	
	return ( 
		<>
			<input
				type="text"
				value={value}
				onChange={(e) => setValue(e.target.value)}
			/>
			<HeavyComponentMemo
				title="Welcome closures"
				onClick={onClick} 
			/>
		</> 
	);
};
```

1. 리렌더링이 발생할 때마다 ref의 current로 새로운 함수를 넣는다.
2. useCallback은 onClick의 참조값을 유지한다.
3. useCallback으로 전달된 콜백은 current를 실행한다.
4. memo로 리렌더링을 막는다.

memo 최적화 참…