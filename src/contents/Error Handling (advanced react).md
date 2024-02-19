---
title: Error Handling (advanced react)
date: 2024-02-14
published: true
category: react
subtitle: A set of two-state buttons that can be toggled on or off
---

### try/catch를 사용해서 에러 핸들링을 할 때 주의할 점

1. useEffect를 try/catch로 감싸도 동작하지 않는다.

   ```jsx
   try {
     useEffect(() => {
       throw new Error('Hulk smash!');
     }, []);
   } catch (e) {
     // useEffect throws, but this will never be called
   }
   ```

   try/catch 실행컨텍스트는 끝나고 렌더링 후에 콜백이 실행됨. 따라서 catch로 잡을 수 없다.

2. 렌더링할 컴포넌트 내부에서 발생한 에러를 try/catch 잡을 수 없다.

   ```jsx
   const Component = () => {
     try {
       return <Child />;
     } catch (e) {
       // anything
     }
   };
   ```

   `<Child>`는 리액트 엘레멘트 객체를 생성하는 함수. 컴포넌트 내부에서 어떤 실행을 하는지는 알 수 없음

3. 렌더링 중에 상태를 업데이트하는 방식은 안된다.

   ```jsx
   const Component = () => {
     const [hasError, setHasError] = useState(false);

     try {
       throwError();
     } catch (e) {
       setHasError(true);
     }
   };
   ```

   위에서는 try/catch문 보다도 setHasError로 인해서 무한 렌더링이 발생하므로 올바르지 않다. useEffect로 감싸던지..

## ErrorBoundary

하위 컨텍스트에서 발생한 에러를 캐치하여 그에 따른 동작을 수행할 수 있는 컴포넌트

- errorboundary는 오직 리액트 라이프 사이클동안에 발생하는 에러만 캐치할 수 있다.
  ex)
  - useEffect 내부 에러 (O)
  - click 이벤트 콜백 (X)
  - fetch 에러 (X)
- 위 불편함을 해소하기 위해서 setState를 동작시키면서 에러를 throw시키면 에러바운더리가 동작한다.
  ```jsx
  const useThrowAsyncError = () => {
    const [state, setState] = useState();

    return (error) => {
      setState(() => throw error);
    };
  };
  ```
  hook으로 빼니깐 나쁘지 않아보임.
  ```jsx
  const Component = () => {
  	const throwAsyncError = useThrowAsyncError();

  	const handleClick = () => throwAsyncError()

  	return (...)
  };
  ```
