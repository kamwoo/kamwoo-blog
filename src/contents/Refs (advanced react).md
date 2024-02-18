---
title: test
date: 2024-02-14
published: true
category: react
subtitle: A set of two-state buttons that can be toggled on or off
---

React는 Real DOM을 복잡한 코드를 추상화하여 컴포넌트를 작성하고 UX에 집중할 수 있게 해준다. 하지만 직접 DOM을 다뤄야하는 순간이 있기 때문에 ref를 사용하게 된다.

## useImperativeHandle

input filed에 흔들리는 에니메이션을 주기 위해서 다음과 같은 코드를 작성할 수 있다.

```jsx
const InputField = () => {
	const [shouldShake, setShouldShake] = useState(false);

  const className = shouldShake ? 'shake-animation' : '';

  return (
    <input
			className={className}
			onAnimationEnd={() => setShouldShake(false)} />
	); 
};
```

위 코드는 focus를 줄 수 없고, 복잡해진다. ref를 사용하여 DOM Element를 사용하면서 선언적인 프로그래밍을 하기 위해서 useImpreativeHandle hook을 사용할 수 있다.

첫번째인자로 ref를 전달받고, 두번째인자로 ref.current를 사용하는 객체를 리턴하는 함수를 전달한다.

```jsx
const InputField = ({ apiRef }) => {
	const [shouldShake, setShouldShake] = useState(false);

	useImperativeHandle(apiRef, () => ({ 
		focus: () => {},
		shake: () => {
			setShouldShake(true); 
		},
	}), [])

	return ...
}
```

위 코드처럼 ref를 전달받아서 useImperativeHandle에 전달하고, api에 따른 동작을 구현한다. 그러면 `InputFiled` 컴포넌트를 사용하는 쪽에서는 ref만 전달하고, api를 선언적으로 사용할 수 있다. 예시 코드는 아래와 같다.
