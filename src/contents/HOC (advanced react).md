---
title: HOC (advanced react)
date: 2024-02-14
published: true
category: react
subtitle: A set of two-state buttons that can be toggled on or off
---

## HOC란

---

high order component란 인자로 컴포넌트를 전달받아 로직이나 다른 컴포넌트를 반환하는 함수를 말한다.

중복을 줄이고, context를 사용하거나 외부 데이터를 subscribe하는데에 많이 사용된다.

아래부터는 HOC를 사용할 수 있는 상황들에 대해서 설명한다.

이 챕터를 읽으면서 굳이 HOC를 써야되는 상황인지 의문이 들었다. 그동안 children을 제외한 HOC를 구현해서 사용해본 경험이 없기 때문. 각 상황에서 HOC가 좋은 방법인지 고민.

## enhancing callback

---

반복되는 콜백, props를 넘겨야하는 경우에 HOC로 중복을 줄일 수있다.

```jsx
const Button = ({ onClick, loggingData }) => { 
	const onButtonClick = () => {
		log('Button was clicked', loggingData);
		onClick(); 
	};

	return <button onClick={onButtonClick}>Click me</button>; 
};
```

Button 컴포넌트에 onClick과 로깅할 데이터를 props로 넘기는 예제이고, 만약 button 뿐만아니라 다른 컴포넌트에서도 같은 동작을 넣기 위해서는 코드를 중복해서 작성해야 한다.

이러한 중복을 해결하기 위해서 아래와 같이 HOC를 만들어 사용할 수 있다.

```jsx
export const withLoggingOnClick = (Component) => { 
	return (props) => {
		const onClick = () => {
			console.log('Log on click something');
			props.onClick();
		};
	
		return <Component {...props} onClick={onClick} />;
	}; 
};

---
export const ButtonWithLoggingOnClick = withLoggingOnClick(SimpleButton);

<withLoggingOnClick >
	<Component />
</withLoggingOnClick>

export const withLoggingOnClick = ({children}) => { 
	const onClick = () => {}

	const compoenent = React.cloneElement(chidlrem)

	return compoenent
};
```

- 위 방식보다는 children을 사용하는게 가독성에 좋다고 생각
- 각 HOC가 반환하는 값에 대해서 파악이 필요하다고 생각

## adding data to the HOC

---

HOC로 리턴된 컴포넌트를 사용할 때, 데이터를 전달하는 방식에 대해서 설명한다.

- 컴포넌트 생성할 때, 필요한 데이터를 인자로 전달
    
    ```jsx
    const ButtonWithLoggingOnClickWithParams = 
    		withLoggingOnClickWithParams(SimpleButton, {
    	    text: 'button component',
    	});
    ```
    
- 리턴된 컴포넌트에서 인자로 전달
    
    ```jsx
    export const withLoggingOnClickWithProps = (Component) => {
    	return ({ logText, ...props }) => {
    		const onClick = () => {
    			console.log('Log on click: ', logText); 
    			props.onClick();
    		};
    
    		return <Component {...props} onClick={onClick} />; 
    	};
    };
    ```
    

## Enhancing React lifecycle event

---

리액트 lifecycle을 사용하는 HOC에 대해서 설명

- 리렌더링이 발생했을 때, 로깅하는 HOC

```jsx
export const withLoggingOnReRender = (Component) => { 
	return ({ id, ...props }) => {

		useEffect(() => {
			console.log('log on id change');
		}, [id]);

    return <Component {...props} />;
  };
};
```

## Intercepting DOM event

---

keyboard 이벤트 제어에 대한 예제

```jsx
export const withSuppressKeyPress = (Component) => {
	return (props) => {
		const onKeyPress = (event) => {
			event.stopPropagation(); 
		};

		return (
				<div onKeyPress={onKeyPress}>
			    <Component {...props} />
	      </div>
			); 
	};
};
```

## React HOC

---

**forwardRef**

HOC는 모든 Props를 래핑된 컴포넌트에 전달하는것이 원칙이다. 하지만 Ref는 key와 같이 특별한 인자로 취급되기 때문에 HOC에서 반환한 element에 ref를 추가하더라도, ref는 바깥쪽 컨테이너 컴포넌트의 인스턴스를 가르킨다.