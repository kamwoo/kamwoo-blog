---
title: re-render (advanced react)
date: 2023-11-28
published: true
category: react
subtitle: A set of two-state buttons that can be toggled on or off
---

## Key Point

---

chapter 1에서는 상태 업데이트에 따른 컴포넌트 리렌더링과 주의점, 방안들에 대해서 얘기한다.

## Key sentence

---

1. 상태 업데이트는 리렌더링을 유발한다. 컴포넌트 리렌더링을 통해서 새로운 데이터를 스크린으로 전달한다.
    
    Q. 리액트는 상태 업데이트를 어떻게 감지하고 리렌더링을 발생시킬까
    
    간단하게 클로저를 사용하고 리액트에서 전역 변수로 관리된다. 이런 내용은 너무 추상적이라 실제로 어떻게 돌아가는지 알아봄.
    
    useState만 뜯어보면 아래와 같이 구현되어 있다.
    
    ```jsx
    function useState(initialState){
    	var dispatcher = resolveDispatcher();
    	return dispatcher.useState(initialState)
    }
    ---
    function resolveDispatcher() {
      const dispatcher = ReactCurrentDispatcher.current
      return dispatcher
    }
    ---
    const ReactCurrentDispatcher = {
      current: null, // 구현체가 들어갈 자리
    }
    ```
    
    useState 내부에서는 dispatcher라는 개념이 있고, 이 dispatcher는 전역 객체에 저장된 함수를 실행하게 되는데, 이 함수가 hook의 구현체이다.
    
    구현체는 reconciler라는 외부 모듈에서 주입받게 된다.
    
    이 reconciler 내부의 여러 모듈의 컨텍스트는 컴포넌트에 한정되어 있고, mount 구현체를 사용한다. setState가 호출되면 mount 구현체 내부에서 컴포넌트 업데이트 정보를 담고 있는 update 객체를 queue에 추가한다.
    
    그와 동시에 workInProgress fiber로 지정되고 beginWork 함수를 실행시켜서 재조정 과정을 거친 후 리얼돔에 반영된다.
    
    1. fiber에 대한 설명
    
    [React Deep Dive — Fiber](https://blog.mathpresso.com/react-deep-dive-fiber-88860f6edbd0)
    
    1. useState에서 시작하여 fiber reconciler, work scheduler까지의 리렌더링을 유발하는 과정을 설명함. 위 내용을 먼저보고 봐야함
    
    [React 톺아보기 - 03. Hooks_1 | Deep Dive Magic Code](https://goidle.github.io/react/in-depth-react-hooks_1/)
    
2. 컴포넌트의 리렌더링은 하위 컴포넌트를 리렌더링 시킨다.
    
    Q. 왜 하위 컴포넌트까지 리렌더링 될까
    
    상태가 변경되면 React는 하위 컴포넌트가 영향을 받는지 아닌지 정확히 알 수 없어서 기본적으로 리렌더링 시킨다고 한다.
    
    브라우저 렌더링 과정에서 element가 렌더링될 때, 부모 요소를 기준으로 위치와 크기를 계산하기 때문이라고 생각. 자식 요소에 z-index를 설정할 때, 부모 컨테이너에 쌓임 맥락이 형성됨.
    
3. props가 변경되어야 리렌더링 되는 것이 아니라 상위 컴포넌트가 리렌더링 된다면 하위 컴포넌트는 무조건 리렌더링 된다. memo로 감싼 hoc는 props의 변경을 확인하고 리렌더링을 멈춘다.
    
    Q. 왜 하위 컴포넌트를 무조건 렌더링 시키는 이유
    
    위에서 말한 이유와 같이 하위 컴포넌트가 영향을 받을지 안받을지 리액트는 알 수 없기 때문에 안전하게 전부 리렌더링 시킨다고 함.
    
    Q. memo는 무조건 좋은 것일까
    
    React.memo는 shallow equality (얕은 비교)를 사용한다. 서로 다른 객체에 있는 모든 개별 필드를 검사하여 객체의 내용이 같은지 다른지 확인한다. 즉, obj1.a === obj2.a && obj1.b === obj2.b && ........를 수행하게 됨.
    
    useMemo든 useCallback이든 memo든 비교 과정이 있고, 연산을 줄일 수 있는 방법을 테스트하면서 찾아보는게 좋음. 근데 웬만하면 비교 연산이 더 적지 않나? 생각함
    
4. 상태를 하위 컴포넌트로 옮길 수록 리렌더링되는 컴포넌트를 줄일 수 있다.
    
    Q. 상태를 하위 컴포넌트로 내리면 되나
    
    불필요하게 상태가 부모 컴포넌트에 존재하거나 상태 업데이트에 관련없지만 렌더링 리소스가 큰 컴포넌트가 같이 있다면 상태를 내리는 것이 좋음
    
    Q. 예시와 같이 컴포넌트로 묶는 방법 외에 어떤 방법이 있을까
    
    합성 방식 사용
    
    ```jsx
    export default function App() {
      return (
        <ColorPicker>
          <p>Hello, world!</p>
          <ExpensiveTree />  // 렌더링 빡센 컴포넌트
        </ColorPicker>
      );
    }
     
    function ColorPicker({ children }) {
      let [color, setColor] = useState("red");
      return (
        <div style={{ color }}>
          <input value={color} onChange={(e) => setColor(e.target.value)} />
          {children}
        </div>
      );
    }
    ```
    
    위 두 질문 모두 Dan 블로그에 잘나와있음
    
    [Before You memo() — overreacted](https://overreacted.io/before-you-memo/)
    
5. hook은 조심해야한다. 내부에서 상태를 업데이트하고 있다면 자신도 모르게 상위 컴포넌트에서 리렌더링을 유발시킬 수 있다. 또한 A hook을 랩핑하고 있는 B hook을 사용하고 있는 경우에 A hook에서 상태 업데이트가 발생한다면 마찬가지로 컴포넌트의 리렌더링을 유발한다.
    
    - hidom에서 랩핑 hook과 위와 비슷한 결과를 유발하는 코드는 어떤게 있을까