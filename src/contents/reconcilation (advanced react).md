---
title: reconcilation (advanced react)
date: 2024-02-14
published: true
category: react
subtitle: A set of two-state buttons that can be toggled on or off
---

## Key Point

---

- 리액트 재조정 과정에서 변경을 감지하는 방식
- DOM 엘레멘트를 재사용한다.

## 내용

---

### 같은 Type인 Input일 때, 다른 Id를 준다면 어떻게 동작할지

```jsx
const Form = () => {
const [isCompany, setIsCompany] = useState(false);

	return ( 
		<>
			{/* checkbox somewhere here */} 

			{ isCompany ? (
				<Input id="company-tax-id-number" placeholder="Enter you company Tax ID" ... />
			):(
				<Input id="person-tax-id-number" placeholder="Enter you personal Tax ID" ... /> )
			}
		</> 
	)
}
```

리액트에 CreateElement로 생성된 객체는 type, props, ref, key가 있다.

id는 단순히 DOM 엘리먼트의 속성으로 새로운 엘리먼트를 생성해서 추가할 필요가 없다.

diffing과정에서 이전의 DOM을 유지하면서 javascript로 DOM 속성을 변경만 해준다.

따라서 위 결과에서는 id, placeholder는 바뀌지만 입력된 text는 유지된다.

**위 결과에서 입력된 text를 유지하지 않도록 해보자**

```jsx
const Form = () => {
const [isCompany, setIsCompany] = useState(false);

	return ( 
		<>
			{/* checkbox somewhere here */} 

			{ isCompany ? (
				<Input id="company-tax-id-number" placeholder="Enter you company Tax ID" ... />
			): null
			}

			{ !isCompany ? (
				<Input id="company-tax-id-number" placeholder="Enter you company Tax ID" ... />
			): null
			}
		</> 
	)
}
```

위 동작은 Form의 children 배열에서 `[checkbox, null, Input]` 과 같이 객체가 생성되고, 배열 순으로 엘레멘트를 검사하기 때문에 DOM 엘레멘트를 새로 그리게 된다.

1. [Checkbox, null, Input]
2. [Checkbox, Input, null]

다른 방법으로 key를 사용할 수 있다. 서로 다른 key를 전달한다면 재조정에서 type 외에 key보고 리렌더링을 진행한다. “state reset”이라고도 한다는데 뭐 굳이..

### Key

type만 비교해서 달라진것을 찾는다면 반복문을 통해서 여러 하위 컴포넌트를 사용할 수 없다.

```jsx
const data = ['1', '2', ~];

const Component = () => {
	// "key" is mandatory here!
	return data.map((value) => <Input id={value} key={value} />);
};
```

위 컴포넌트에서 key가 없다면 Input의 순서가 달라져도 알 수 없기 때문에 DOM 엘레멘트는 유지되면서 속성만 바뀐다. key를 통해서 생선된 인스턴스를 구분하고 재사용한다.

**memoization한 컴포넌트와 key를 index로 할 때, 유니크한 문자로 할 때**

```jsx
const data = [
  { id: 'business', placeholder: 'Business Tax' },
  { id: 'person', placeholder: 'Person Tax' },
];

const InputMemo = React.memo(Input);
 
const Component = () => {
  // array's index is fine here, the array is static

	return data.map((value, index) => ( 
			<InputMemo
				key={index}
				placeholder={value.placeholder} 
			/>
	)); 
};
```

위 예제는 순서가 바뀐다고 하면 Input이 memo 되어 있어도 리렌더링된다.

key가 index로 되어있기 때문에 0번째 Input에 id, placeholder가 변경된 것이기 때문에 리렌더링된다.

key를 id로 한다면 이전에 사용한 DOM을 그대로 사용하기 때문에 리렌더링이 발생하지 않는다.

### 컴포넌트 내부에서 컴포넌트를 정의하는 것이 왜 안티패턴인지

```jsx
const Component = () => {
	const Input = () => <input />;

	return <Input />;
};
```

재조정 과정에서 Type을 검사할 때, 매번 다른 Input 함수를 비교하게 된다.

매번 DOM 엘레멘트를 지우고 새로 만들게 되고, 컴포넌트가 무거우면 깜빡거리는 문제도 발생할 수 있다.