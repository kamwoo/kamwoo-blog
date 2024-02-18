---
title: test
date: 2024-02-14
published: true
category: react
subtitle: A set of two-state buttons that can be toggled on or off
---

**확장성 있는 컴포넌트 구현**

button에 icon 표시 예제

using element props instead of props control

```jsx
<Button icon={<Loading />} />
```

디자인 의존성이 높음

children과 차이점은 지정한 Layout에 element를 놓는것

children은 syntax sugar에 가까움

조건부 렌더링과 성능

```jsx
const App = () => {
const [isDialogOpen, setIsDialogOpen] = useState(false);
  // when is this one going to be rendered?
  const footer = <Footer />;

	return isDialogOpen ? ( 
		<ModalDialog footer={footer} />
	) : null; 
};
```

위 예제에서 Footer 컴포넌트는 DOM에 반영되지 않지만 렌더링 되는 것이 아닌가

→ diffing 과정에서 변화는 없기 때문에 함수만 선언되었고 DOM commit은 발생하지 않음. 함수만 메모리에 올리니깐 괘찮

```jsx
const App = () => { return (
	<>
		<Route path="/some/path" element={<Page />} /> 
		<Route path="/other/path" element={<OtherPage />} /> 
		...
	</> 
	);
}
```

위 예제에서는 Page랑 OtherPage 컴포넌트 둘다 렌더링 되지는 않는다. 조건부가 아니라서 컴포넌트 함수 실행은 되지만 내부에서 Path에 조건부가 있기 때문에 diffing에 잡히지 않음

default value for the element as props

props로 전달되는 element에도 default props를 줄 수 있음

cloneElement 사용

```jsx
const Button = ({ appearance, size, icon }) => { // create default props
	const defaultIconProps = {
	    size: size === 'large' ? 'large' : 'medium',
	    color: appearance === 'primary' ? 'white' : 'black',
	  };

	const newProps = {
		...defaultIconProps,
		// make sure that props that are coming from the icon override default if they exist
	   ...icon.props,
  };
	
	// clone the icon and assign new props to it
	const clonedIcon = React.cloneElement(icon, newProps); 

	return <button>Submit {clonedIcon}</button>;
};
```

element props의 default props의 override가 쉬워서 문제가 된다고 생각하면, 위 예제에서 newProps를 없애는 것으로 override 못하게 막는다.
