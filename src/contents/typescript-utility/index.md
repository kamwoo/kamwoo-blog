---
title: typescript utility
published: true
category: typescript
subtitle: TypeScript 유틸리티 타입들(Partial, Readonly, Record, Pick, Omit 등)의 사용법과 예제
date: 2022-07-18
---


1. `Partial<T>`
    
    T의 모든 프로퍼티를 옵셔널로 만든다. 주어진 타입의 모든 하위 타입 집합을 나타내는 타입을 반환한다.
    
2. `Readonly<T>`
    
    T의 모든 프로퍼티를 읽기 전영으로 설정한 타입을 반환한다.
    
    Object.freeze를 만들 수 있다.
    
3. `Record<K ,T>`
    T의 프로퍼티의 집합 K로 타입을 구성한다. 타입의 프로퍼티들을 다른 타입에 매핑시키는 데 사용한다.
    
	```tsx
	interface PageInfo {
		title: string;
	}
	
	type Page = 'home' | 'about' | 'contact';
	
	const x: Record<Page, PageInfo> = {
		about: { title: 'about' },
		contact: { title: 'contact' },
		home: { title: 'home' },
	};
	```
	K의 집합을 key로 구성하고, 각 key는 PageInfo로 type을 매핑한다.
    
1. `Pick<T, K>`
    
    T에서 프로퍼티 K의 집합을 선택해 타입을 구성한다.
    
    ```tsx
    interface Todo {
        title: string;
        description: string;
        completed: boolean;
    }
    
    type TodoPreview = Pick<Todo, 'title' | 'completed'>;
    
    const todo: TodoPreview = {
        title: 'Clean room',
        completed: false,
    };
    ```
    
    TodoPreview는 K의 집합을 선택적으로 key로 가질 수 있다.
    
5. `Omit<T, K>`
    
    T에서 모든 프로터티를 선택한 다음 K를 제거한 타입을 구성한다.
    
    ```tsx
    interface Todo {
        title: string;
        description: string;
        completed: boolean;
    }
    
    type TodoPreview = Omit<Todo, 'description'>;
    
    const todo: TodoPreview = {
        title: 'Clean room',
        completed: false,
    };
    ```
    
6. `Exclude<T, U>`
    
    T에서 U와 겹치는 프로퍼티를 제외한 타입을 구성한다.
    
    ```tsx
    type T0 = Exclude<"a" | "b" | "c", "a">;  // "b" | "c"
    type T1 = Exclude<"a" | "b" | "c", "a" | "b">;  // "c"
    type T2 = Exclude<string | number | (() => void), Function>;  // string | number
    ```
    
7. `Extract<T, U>`
    
    T에서 U와 겹치는 프로퍼티로 타입을 구성한다.
    
    ```tsx
    type T0 = Extract<"a" | "b" | "c", "a" | "f">;  // "a"
    type T1 = Extract<string | number | (() => void), Function>;  // () => void
    ```
    
8. `NonNullable<T>`
    
    T에서 null과 undefined를 제외한 타입을 구성한다.
    
9. `Parameters<T>`
    
    함수 타입 T의 매개변수 타입들의 튜플 타입을 구성한다.
    
    ```tsx
    declare function f1(arg: { a: number, b: string }): void
    
    type T4 = Parameters<typeof f1>;  // [{ a: number, b: string }]
    
    ---
    
    type T1 = Parameters<(s: string) => void>;  // [string]
    ```
    
10. `ConstuctorParameters<T>`
    
    생성자 함수 타입의 매개변수 타입의 튜플 타입을 구성한다.
    
    ```tsx
    type T0 = ConstructorParameters<ErrorConstructor>;  // [(string | undefined)?]
    type T1 = ConstructorParameters<FunctionConstructor>;  // string[]
    type T2 = ConstructorParameters<RegExpConstructor>;  // [string, (string | undefined)?]
    ```
    
11. `ReturnType<T>`
    
    함수 타입 T의 반환 타입으로 구성된다.
    
    ```tsx
    declare function f1(): { a: number, b: string }
    
    type T4 = ReturnType<typeof f1>;  // { a: number, b: string }
    
    --- 
    
    type T1 = ReturnType<(s: string) => void>;  // void
    ```
    
12. `InstanceType<T>`
    
    생성자 함수 타입 T의 인스턴스 타입으로 구성된 타입을 만든다.
    
    ```tsx
    class C {
        x = 0;
        y = 0;
    }
    
    type T0 = InstanceType<typeof C>;  // C
    ```
    
13. `Required<T>`
    
    T의 모든 프로퍼티가 필수로 설정된 타입을 구성한다.
    
    ```tsx
    interface Props {
        a?: number;
        b?: string;
    };
    
    const obj2: Required<Props> = { a: 5 }; // 오류: 프로퍼티 'b'가 없습니다
    ```
    
14. ThisParameterType
    
    함수 타입에 this 매개변수의 타입을 추출한다.
    
15. OmitThisParameter
    
    함수 타입에 this 매개변수를 제거한다.
    
16. `ThisType<T>`
	```tsx
type ObjectDescriptor<D, M> = {
    data?: D;
    methods?: M & ThisType<D & M>;  // 메서드 안의 'this 타입은 D & M 입니다.
}

function makeObject<D, M>(desc: ObjectDescriptor<D, M>): D & M {
    let data: object = desc.data || {};
    let methods: object = desc.methods || {};
    return { ...data, ...methods } as D & M;
}

let obj = makeObject({
    data: { x: 0, y: 0 },
    methods: {
        moveBy(dx: number, dy: number) {
            this.x += dx;  // 강하게 타입이 정해진 this
            this.y += dy;  // 강하게 타입이 정해진 this
        }
    }
});

obj.x = 10;
obj.y = 20;
obj.moveBy(5, 5);
```