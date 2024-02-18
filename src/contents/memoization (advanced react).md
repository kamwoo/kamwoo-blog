---
title: memoization (advanced react)
date: 2024-02-14
published: true
category: react
subtitle: A set of two-state buttons that can be toggled on or off
---

## key Point

---

useMemo, useCallback, React.memo를 사용할 때 유의점에 대해서 설명

## Key Sentences

---

- dependencies에 추가할 때, 레퍼런스를 확인해야한다.
- useCallback을 콜백 자체를 반환하고, useMemo는 콜백을 실행한다.

컴포넌트 내부에서 선언된 함수를 그대로 useCallback이나 useMemo dependencies로 넣으면 레퍼런스는 매번 달라지기 때문에 리렌더링이 발생할 때마다 false로 계산되어서 의도하는 대로 동작하지 않음

이러한 상황에서 denpendency에 들어가는 객체를 useCallback이나 useMemo로 감싼다.

## memoized props

```jsx
const Component = () => {
	const a = useCallback(() => {
	}, []);
	
	return <button onClick={onClick}>click me</button>; 
};
```

위 예제에서 onClick을 감싸도 필요없다. Props로 리렌더링되는게 아니라 상위 컴포넌트 리렌더링이 하위 컴포넌트를 리렌더링 시키기 때문

## react.memo

부모 컴포넌트의 리렌더링으로부터 하위 컴포넌트의 리렌더링이 발생하는 경우에 Props를 비교해서 변경이 없을 경우에 불필요한 리렌더링을 막을 수 있다.

memo가 안먹히는 경우

```jsx
const Child = ({ data, onChange }) => {}; 
const ChildMemo = React.memo(Child);

const Component = () => {
	// object and function declared inline
	// will change with every re-render
	return (
		<ChildMemo 
			data={{ ...some_object }} 
			onChange={() =>{...}} />
		) 
}
```

위 예제에서 data는 새로운 객체, 함수는 인라인으로 새로운 함수(객체)가 생성되기 때문에 레퍼런스가 다름

따라서 아래와 같이 써야함

```jsx
const Child = ({ data, onChange }) => {}; 
const ChildMemo = React.memo(Child);

const Component = () => {
	const data = useMemo(() => ({ ... }), []); // some object 
	const onChange = useCallback(() => {}, []); // some callback

	// data and onChange now have stable reference
	// re-renders of ChildMemo will be prevented
	return <ChildMemo data={data} onChange={onChange} />
}
```

신박한 예제

```jsx
const Child = () => {};
const ChildMemo = React.memo(Child);

const Component = (props) => { 
	return <ChildMemo {...props} />;
};

const ComponentInBetween = (props) => { 
	return <Component {...props} />;
};

const ref = { current:  }

const InitialComponent = (props) => {
		// this one will have state and will trigger re-render of Component
		const ref = useRef({
			
		})

		return (
		<ComponentInBetween {...props} data={ref} />
	); 
};
```

위 예제에서 InitialComponent에서 data props가 새로운 객체를 계속 내려주기 때문에 맨 하위에 ChildMemo도 메모이징이 깨진다.

## react.memo hoc를 사용할 때 규칙

1. Props로 스프레드 문법을 사용하지 않는다.
2. 다른 컴포넌트에서 전달받은 원시타입이 아닌 데이터를 Props로 넘기지 않는다.
3. hook으로 생성된 원시 타입이 아닌 데이터를 Props로 넘기지 않는다.

### children as props

React.memo로 컴포넌트를 감싸더라도 children으로 넘기는 부모 컴포넌트가 있으면 memo로 감쌀 필요가 없다. children도 props로써 비교할 때, 레퍼런스가 다르기 때문이다.

때문에 Memo가 유용할려면 넘기는 children 컴포넌트를 useMemo로 감싸던가 해야함

useMemo는 연산이 많이 듬

- 측정 먼저
