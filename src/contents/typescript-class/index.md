---
title: typescript class
published: true
category: typescript
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-07-14
---


1. 접근 제어 속성 설정
    
    public: 클래스 외부에서 접근 가능, 기본값
    
    private: 클래스 내부에만 접근 가능
    
    protected: 클래스를 포함한 서브 클래스에서만 접근 가능
    
    클래스 상단에 prop으로 설정해놨으면 별도로 선언할 필요는 없다.
    
2. 접근 제어 메소드 설정
    
    public, private, protected 똑같다.
    
3. 상속
    
    extends로 상속
    
    private 접근 제어자로 지정된 것은 상속할 수 없고, 덮어쓸 수 없다.
    
    super를 씀
    
4. getter, setter
    
    외부에서 조작할 수 없어야할 prop를 private로 설정하고 get, set으로 접근해서 값을 가져오고, 변경할 수 있다.
    
5. 정적 속성/ 메소드
    
    기존에 js에서 static과 다르게 this로 접근할 수 있다. 그 외 기능은 똑같다.
    
    ```tsx
    class Mathmatics {
    
      // 스태틱 속성
      static PI:number = Math.PI;
    
      // 스태틱 메서드
      // circumference = 둘레(원주)
      static calcCircumference(radius:number) :number {
        return this.PI * radius * 2;
      }
    
      static calcCircleWidth(radius:number): number {
        return this.PI * Math.pow(radius, 2);
      }
    
    }
    ```
    
6. 추상 클래스
    
    추상 클래스를 정의할 때는 class 앞에 abstract를 표기한다.
    
    내부에서 속성, 추상 메소드, 실제 메소드를 정의할 수 있다.
    
    추상 메소드는 앞에 abstract를 표기해야한다.
    
    추상 클래스는 인스턴스를 만들 수 없다.
    
    ```tsx
    abstract class Project {
    
      public project_name:string|null = null;
      private budget:number = 2000000000; // 예산
    
      // 추상 메서드 정의
      public abstract changeProjectName(name:string): void;
    
      // 실제 메서드 정의
      public calcBudget(): number {
        return this.budget * 2;
      }
    
    }
    ```
    
    상속 받은 클래스는 추상 클래스 내에 정의된 추상 메소드를 반드시 구현해야 한다.
    
7. 싱글톤
    
    constructor 앞에 private를 표기하여 인스턴스 생성을 막고, 레이아웃 상위 프로퍼티로 자신을 타입으로 지정한 instance 객체 변수를 리턴함으로써 싱글톤을 구현
    
    ```tsx
    class OnlyOne {
    
      private static instance: OnlyOne;
    
      public name:string;
    
      // new 클래스 구문 사용 제한을 목적으로
      // constructor() 함수 앞에 private 접근 제어자 추가
      private constructor(name:string) {
        this.name = name;
      }
      
      // 오직 getInstance() 스태틱 메서드를 통해서만
      // 단 하나의 객체를 생성할 수 있습니다.
      public static getInstance() {
        if (!OnlyOne.instance) {
          OnlyOne.instance = new OnlyOne('싱글턴 객체');
        }
        return OnlyOne.instance;
      }
      
    }
    
    let good_case = OnlyOne.getInstance();
    ```
    
    컴파일 된 es5에서는 적용이 안된다.
    
8. 읽기 전용 속성
    
    readonly를 표기하면 읽기 전용 속성이 되어 다른 값으로 변경할 수 없다.
    
    ```tsx
class OnlyOne {

  private static instance:OnlyOne;

  // 읽기 전용 속성 설정
  public readonly name:string;

  private constructor(name:string) {
    this.name = name;
  }

  public static getInstance(name:string):OnlyOne {
    if (!OnlyOne.instance) {
      OnlyOne.instance = new OnlyOne(name);
    }
    return OnlyOne.instance;
  }

}

/* 인스턴스 생성 ------------------------------------------------ */

let special_one = OnlyOne.getInstance('스페셜 원');

console.log(special_one.name);

// [오류]
// [ts] 상수 또는 읽기 전용 속성이므로 'name'에 할당할 수 없습니다.
// (property) OnlyOne.name: string
special_one.name = '노멀 원';
```