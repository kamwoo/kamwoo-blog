---
title: types
published: true
category: typescript
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-06-07
---

1. primitive
    
    원시 데이터 타입으로 number, string, boolean
    
    ```tsx
    // 명시적으로 number 타입을 설정
    let product_id:number = 124981;
    
    // 명시적으로 string 타입을 설정
    let product_name:string = 'VR 글래스';
    
    // 명시적으로 boolean 타입을 설정
    let is_waterprofing:boolean = false;
    ```
    
2. unknown
    
    unknown은 타입가드를 사용하도록 유도한다.
    
3. any
    
    어떤 값이든 재할당 가능하다.
    
    어떤 타입을 할당해야 할지 모를 경우 사용할 수 있고, 되도록 사용하지 말 것
    
4. array
    
    ```tsx
    // 오직 숫자 아이템만 허용
    let nums:number[] = [100, 101, 102];
    
    // 오직 문자 아이템만 허용
    let strs:string[] = ['ㄱ', 'ㄴ', 'ㄷ'];
    
    // 오직 불리언 아이템만 허용
    let boos:boolean[] = [true, false, true];
    
    // 모든 데이터 타입을 아이템으로 허용
    let anys:any[] = [100, 'ㄴ', true];
    
    // 특정 데이터 타입만 아이템으로 허용
    let selects:(number|string)[] = [102, 'ㅇ'];
    ```
    
    타입 지정이 없더라도 암시적으로 설정이 된다.
    
    ```tsx
    let members = ['이권', '감장겸', '장도일'];
    members = [9, 13, 26]; // 오류
    members  = 201 // 오류
    ```
    
5. tuple
    
    지정된 형식에 따라 아이템 순서를 설정해야 되고, 추가 되는 아이템 또한 tuple 타입만 가능하다.
    
    ```tsx
    let book__name_price:[string, number] = ['카밍 시그널', 13320];
    
    book__name_price = [13320, '카밍 시그널']; // 오류 순서도 지켜야 한다.
    
    ```
    
6. enum
    
    멤버라고 불리는 값의 집합을 이루는 자료형. 각 멤버는 값이 설정되지 않을 경우 순서대로 0~ 의 값을 가진다.
    
    ```tsx
    enum Team {
      Manager   = 101,
      Planner   = 208,
      Developer = 302,
      Designer, // 302 + 1
    }
    
    let yamoo9:number = Team.Manager; // (enum member) Team.Manager = 101
    let sarha:number = Team.Designer; // (enum member) Team.Designer = 303
    ```
    
    숫자값을 통해 멤버 이름을 도출할 수 있다.
    
    ```tsx
    let role:string = Team[302]; // 'Developer'
    ```
    
7. function / union / void
    
    function
    
    ```tsx
    function setInfo(id:number, name:string) {
      return { id, name };
    }
    
    let product_one = setInfo(120912, '스노우보드');
    ```
    
    union : 매개변수에 설정 가능한 타입을 여러개 사용하게 설정하는 것, |
    
    ```tsx
    function setInfo(id:number|string, name:string){
      return { id, name };
    }
    ```
    
    void
    
    결과 값을 반환하지 않는 함수에 설정
    
    ```tsx
    function assignClass(name:string): void {
      document.documentElement.classList.add(name);
    }
    ```
    
    함수 식
    
    변수에 함수를 할당하는 식
    
    ```tsx
    let assignClass: (n:string) => void
    
    let assignClass = function(name){
    	console.log('')
    }
    
    ```
    
8. object
    
    변수에 초기 설정된 값을 암시적으로 할당 가능한 데이터 타입으로 설정하기 때문에 달ㄴ 형태로 할당될 경우 다음과 같은 오류를 출력한다.
    
    ```tsx
    let Dom: {
    	version:string, 
    	el:()=>void, 
    	css:()=>void
    };
    
    Dom = {
      version: '0.0.1',
      el(){},
      css(){}
    };
    
    Dom = {
    	append(){} //에러 타입으로 설정되지 않은 속성을 추가했다.
    }
    ```
    
    매번 추가할 때 타입을 지정하기 번거롭다. 그래서
    
    ```tsx
    let Dom: {
      version: string,
      el: () => void,
      css: () => void,
      [propName: string]: any // ⬅︎ 오류를 내지 않게 한다.
    };
    ```
    
9. null, undefined
    
    데이터 타입, 하나의 값이다.
    
    "strictNullChecks”설정이 true일 경우
    
    ```tsx
    let nullable: null = null;
    
    nullable = undefined; // 오류 null과 undefined는 다른 타입
    ```
    
    false는 상관없다.
    
10. never
    
    가장 작은 집합으로 아무 값도 포함하지 않는 공집합이다. never로 선언된 변수는 아무런 값도 할당할 수 없다.
    
    일반적으로 함수의 리턴 타입으로 사용된다. 항상 오류를 출력하거나 리턴 값을 절대로 내보내지 않음을 의미한다. 무한 루프에 빠지는 것과 같다.
    
    ```tsx
    // 항상 오류 발생
    function invalid(message:string): never {
      throw new Error(message);
    }
    
    // 무한 루프
    function infiniteAnimate(): never {
      while ( true ) { infiniteAnimate(); }
    }
    
    ```
    
11. 사용자 정의 타입
    
    type alias를 정의하려면 type키워드를 사용한다.
    
    ```tsx
    // 타입 별칭(Type Alias)
    type operation = {
      data: number[],
      output:(num:number)=>number[]
    };
    
    // 사용자 정의 타입 operation 적용 예시
    let sum:operation = {
      data: [10, 30, 60],
      output(num){
        return this.data.map(n=>n+num);
      }
    };
    ```
    
12. 타입 어설션
    
    type assertion이란 컴파일러에게 “이 타입이 특정 타입 임을 단언한다.”라고 말하는 것.
    
    타입 cast와 비슷하고, 오직 컴파일 과정에서만 사용된다. 2가지 방법이 있다.
    
    1. angle braket
        
        ```tsx
        let assertion:any = "타입 어설션은 '타입을 단언'합니다.";
        
        // 방법 1: assertion 변수의 타입을 string으로 단언 처리
        let assertion_count:number = (<string>assertion).length;
        ```
        
    2. as