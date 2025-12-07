---
title: type system
published: true
category: typescript
subtitle: React 컴포넌트 타이핑, 컴파일과 런타임 차이, 이벤트 타입, 구조적 서브 타이핑에 대한 TypeScript 가이드
date: 2022-08-05
---
## keyword

1. Component Typing With Children
    
    React.FC를 사용하게 되면 문맥적 타이핑을 통해서 타입을 기술할 수 있다.
    
    ```tsx
    const component: React.FC<{ text: string}> = ({text}) => {
    	return (
    		<div>{text}</div>
    	)
    }
    ```
    
    React.FC는 제네릭을 통해서 함수의 Props의 타입을 정의하고 리턴값으로 React.ReactElement<any, any> | null을 반환하는 타입이다. 때문에 FC는 항상 반환타입이 정해져있다. 조건 렌더링을 할 경우에 undefined를 반환할 수 없다.
    
    Props의 타입의 속성으로 children을 명시하고, 상황에 따라서 React.ReactNode와 React.ReactElement를 병행하여 사용한다.
    
    `React.PropsWithChildren`을 사용하지 않고 children을 따로 명시하는 이유는 `ReactNode`와 `ReactElement`를 같이 사용하기 때문에 일관성을 유지하기 위함이다.
    
    ```tsx
    type AComponentProps = {
    	children: React.ReactNode;
    }
    
    const AComponent = ({children}: ACompoenentProps): React.ReactNode =>{
    	return (
    		<div>{children}</div>
    	)
    }
    
    ---
    
    type BComponentProps = {
    	children: React.ReactElement<{text: string}, 'div'>;
    }
    
    const BComponent = ({children}: BComponentProps) => {
      return (
        <div>{children}</div>
      )
    }
    ```
    
    위 예제 코드를 보면
    
    children에 특정한 형태를 전달받는 일반적으로 상황이라면 React.ReactNode를 사용한다. ReactNode 타입은 다음과 같다.
    
    ```tsx
    type ReactNode = ReactElement | string | number | ReactFragment | ReactPortal | boolean | null | undefined;
    ```
    
    children으로 ReactElement외 함수 컴포넌트가 리턴하는 모든 타입을 받을 수 있게 된다.
    
    만약 특정한 타입의 컴포넌트를 받고 싶다면 React.ReactElement를 사용한다. BComponent와 같은 경우에는 text를 Prop으로 전달받고
    
2. TypeScript 관점에서 컴파일 & 런타임 차이를 두고 타이핑 하는 방법
    
    컴파일 과정에서 타입 체크는 정상적으로 타입이 사용되었는지 확인하는 과정이다. 타입을 체크할 수 있는 것은 A 타입에 B 타입을 할당할 수 있는지 또는 A 타입의 어떤 속성에 접근할 수 있는지이다. 컴파일 과정에서 이러한 타입을 잡으므로써 런타임 과정에서 반드시 발생할 수 있는 에러를 방지할 수 있다.
    
    하지만 런타임 과정은 컴파일 과정과 다르다. 타입을 체크하는 것이 아닌 타입을 활용해서 분기처리 또는 타입에 따른 동작을 하도록 할 수 있다. 예를 들어서 아래와 같은 상황이다.
    
    ```tsx
    const print(thing: string | number){
    	if (typeof thing === 'number'){
    		console.log(`number ${thing}`) 
    	} else if (typeof thing === 'string'){
    		console.log(`string ${thing}`
    	}
    }
    ```
    
3. Event Type
    
    React에서 제공하는 Event의 유형별 Handler와 함수 자체의 타입을 정의하면서 인자의 타입을 정의하는 두 가지 방법이 있고, 이 두 방법은 호환된다. 예시 코드는 다음과 같다.
    
    ```tsx
    type Props = {
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    }
    
    const Component = ({onChange}: Props) => {
      return <input onChange={onChange}></input>
    }
    
    --- 
    const A = () => {
      const handleChange: React.ChangeEventHandler<HTMLInputElement> =() => {
    
      }
    
      return (
        <Component onChange={handleChange} />
      )
    }
    ```
    
4. 타입 안정성
    
    타입을 이용해서 프로그램이 유효하지 않은 작업을 수행하지 않도록 방지한다.
    
5. 구조적 서브 타이핑
    
    객체의 이름과 상관없이 어떤 프로퍼티를 가지고 있는지를 따지는 것을 말한다.
    
    서브 타입이란 A와 B라는 타입이 있을 때, B가 A의 서브타입이라면 A가 사용되는 곳 어디에서든지 B를 사용할 수 있다.
    
    서로 다른 두 타입간의 호환성은 오로지 타입 내부의 구조에 의해서 결정된다. 때문에 타입이 계층 구조로부터 자유로워질 수 있다.
    
6. `a에 b를 할당할 수 없습니다`
    
    오탈자를 잡을 수 있는 이유는 초과 프로퍼티 확인 기능 때문이다. fresh 객체 리터럴 타입 T를 다른 타입 U에 할당하려고 할 때, T가 U에는 존재하지 않는 프로퍼티를 가지고 있다면 에러로 처리한다.
    
    fresh 객체 리터럴 타입이란 타입 스크립트가 객체 리터럴로부터 추론한 타입을 말한다. 객체 리터럴이 assertion을 사용하거나 변수로 할당되면 fresh 객체 리터럴은 일반 타입 객체 타입으로 넓혀지면서 fresh함은 사라진다.
    
    위 예시 코드에서 생성자 함수의 인자로 전달된 객체를 fresh 객체로 볼 수 있다. 타입 assertion이 완료되지 않으면 초과 프로퍼티 확인을 시작한다.해결 방법으로는 선언된 프로퍼티를 정상적으로 사용해야한다.
