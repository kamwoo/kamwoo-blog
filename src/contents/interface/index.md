---
title: typescript interface
published: true
category: typescript
subtitle: TypeScript interface의 개념, 특징, implements, 옵셔널 프로퍼티, 인덱스 시그니처, 함수 타입에 대한 가이드
date: 2022-07-08
---

- 객체, 클래스를 위한 타입을 지정한다.
- 구현없이 프로퍼티, 메소드 등을 명시만 해놓는 객체
- implements로 상속 받는다.

```tsx
interface shape{
	getArea(): number;
}

class Rect implements shape {
	width: number;
	height: number;

	constructor(width, height) {
		this.width = width;
		this.height = height;
	}
}

type Person {
	name: string;
	age?: number;
}

const person: Person = {
	name: "loopy";
	age: 20;
}
```

특징

1. implements를 하지않은 클래스라도 명시된 프로퍼티, 메소드가 구현되어 있으면 같은 객체로 본다.
2. 옵셔널 프로퍼티를 가진다.
3. interface대로 구현한 메소드는 타입을 명시할 필요는 없다.

interface끼리 extends를 통해 상속을 할 수 있다.

type alias와 다른점은 interface는 중복된 선언을 할 수 있고, type은 에러가 난다.

1. interface를 구현하는 객체는 옵셔널을 제외한 모든 추상 메소드를 구현해야한다.
    
2. 매개변수에도 interface를 설정할 수 있고, 정의된 요구 사항을 모두 충족해야한다.
    
3. 꼭 implements가 아니라, 객체 리터럴에도 interface를 설정할 수 있다.
    
    ```tsx
    interface OnInitInterface {
      onInit():void;
      initialize():void;
    }
    
    const o:OnInitInterface = {
      onInit():void { console.log('onInit 라이프 사이클') },
      initialize():void { console.log('객체 초기화') }  
    };
    ```
    
4. 옵셔널(?)로 선택적으로 구현할 수 있다.
    
5. readonly를 표기하여 초기값을 설정하고 변경하지 못하게 할 수 있다.
    
    ```tsx
    interface Notebook { 
      readonly CPU: string; 
      readonly RAM: string;
    };
    
    let mackbook:Notebook = { 
      CPU: '2.9GHz 코어 i9',
      RAM: '32GB'
    };
    
    // [오류]
    // 'RAM'은 읽기 전용 속성 또는 상수로 변경할 수 없습니다.
    // (property) Notebook["RAM"]: string
    macbook.RAM = '128GB';
    ```
    
6. 시그니처
    
    클래스에 implements를 한다면 interface에서 새로운 속성, 메소드를 추가할 수 있지만, 객체 리터럴에서는 추가할 수 없다.
    
    해결하는 방법으로 인덱스 시그니처 속성을 선언한다.
    
    ```tsx
    interface ButtonInterface {
      onInit?():void;
      onClick():void;
      // 인덱스 시그니처
      [prop:string]: any;
    }
    
    const button:ButtonInterface = {
      type: 'button',
      disabled: false,
      onClick() { console.log('버튼 클릭') }
    };
    ```
    
7. 함수 타입
    
    interface는 객체 뿐만 아니라 함수로 설정할 수 있다. 매개변수, 리턴값의 타입을 설정하면 구현하는 함수에는 타입을 표기하지 않아도 된다.
    
    ```tsx
    // 펙토리얼 함수 인터페이스 정의
    interface FactorialInterface {
      (n: number): number;  
    }
    
    // 인터페이스를 함수 타입에 설정했기에 별도의 매개변수, 리턴 값 설정을 생략해도 됩니다.
    const facto: FactorialInterface = (n) => {
      if (n === 0) { return 0; }
      if (n === 1) { return 1; }
      return n * facto(n - 1);
    };
    ```
    
    설정을 받은 상태에서 임의로 타입을 변경하면 에러가 발생한다.