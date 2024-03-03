---
title: namespace and module
published: true
category: typescript
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-07-03
---

# namespace, module

namespace: 객체를 사용해 범주를 생성하며 여러 파일로 나눠 개발 확장 할 수 있고 연결 가능하다.

**대규모 앱 개발 시에 컴포넌트 의존성을 구별하기 어려울 수 있다.**

module: namespace와 차이점은 모듈 상단에 의존성을 선언한다. 활용하기 위해서 로더 또는 번들러가 필요하다.

**대규모 앱 개발 시에 모듈성, 유지관리 이점이 있다.**

> 타입을 추적하고 다른 객체와 이름 충돌을 방지하기 위해서 일종의 구조 체계가 필요하다. 전역 네임스페이스에 다른 이름을 많이 넣는 대신, 객체들을 하나의 네임스페이스로 감싼다.

1. namespace
    
    ```tsx
    namespace Dom {
    
      // 외부에서 접근 불가
      const document = window.document;
    
      // 외부에서 접근 가능하도록 export
      export function el(selector:string, context:HTMLElement|Document = document) {
        return context.querySelector(selector);
      }
    
      // 외부에서 접근 가능하도록 export
      export function els(selector:string, context:HTMLElement|Document = document) {
        return context.querySelectorAll(selector);
      }
    
      // export 하지 않은 네임스페이스 내부에 정의된 함수는 외부에서 접근 불가
      function each(list:any[], callback:(item:any, index:number, list:any[])=>void): void {
        list.forEach(callback);
      }
    
    }
    
    // [오류]
    // [ts] 'el' 이름을 찾을 수 없습니다.
    // any
    console.log(el('body')); // 오류
    
    // [오류]
    // [ts] 'typeof Dom' 형식에 'each' 속성이 없습니다.
    // any
    Dom.each([1, 4, 9], (item, index) => console.log(index, item));
    
    // 네임스페이스 Dom을 통해서만 정의된 el()에 접근 사용 가능합니다.
    console.log(Dom.el('body'));
    ```
    
2. namespace 멀티 파일 관리
    
    같은 namespace를 여러 파일에서 나눠서 관리할 수 있다.
    
    ex) Dom이라는 namespace를 event.ts , selector.ts에서 작성할 수 있다.
    
    namespace를 사용하는 방법
    
    1. 컴파일 된 파일 로드
        
        html에 컴파일된 js를 script로 먼저 호출한다. //비추
        
    2. 파일 번들링
        
        namespace 파일들을 병합한 후, dist 폴더에 새로운 파일을 만든다.
        
        ```tsx
        # tsc --outFile <생성할 파일.js> [<namespace 파일 1>, <namespace 파일 1>, ...]
        $ tsc --outFile dist/Dom.js Dom/selector.ts Dom/events.ts
        ```
        
    3. import 활용
        
        ```tsx
        /// <reference path="./Dom/selectors.ts" />
        /// <reference path="./Dom/events.ts" />
        
        let body = Dom.el('body');
        
        Dom.on(body, 'click', function(e) {
          this.classList.toggle('clicked');
        });
        ```
        
3. namespace 중첩
    
    namespace내부에 namespace를 선언하고 export할 수 있다.
    
    중첩된 namespace에 접근하기 위해 코드가 길어지면 import로 참조시킬 수 있다.
    
    ```tsx
    /// <reference path="./Dom.ts" />
    
    // Dom.Events 네임스페이스를 import 하여 Events 변수에 참조
    import Events = Dom.Events;
    
    let body = Dom.el('body');
    
    Events.on(body, 'click', function(e) {
      this.classList.toggle('clicked');
    });
    ```
    
4. module
    
    모듈은 파일 자체 범위 내에서 실행된다. 모듈 내 선언된 변수, 함수, 클래스 등을 명시적으로 내보내지 않는 이상 모듈 외부에서 접근할 수 없다.
    
    걍 js에서 export import
    

## namespace를 사용하지 않는 이유

> 모듈의 소비자는 내보낸 것을 사용할 때 가능한 한 마찰이 적어야 합니다. 중첩 수준을 너무 많이 추가하는 것은 번거로운 경향이 있으므로 구성할 방법에 대해 신중하게 생각하십시오.
> 
> 모듈에서 네임스페이스를 내보내는 것은 중첩 레이어를 너무 많이 추가하는 예입니다. 네임스페이스는 때때로 용도가 있지만 모듈을 사용할 때 추가 수준의 간접 참조를 추가합니다. 이는 사용자에게 빠르게 골칫거리가 될 수 있으며 일반적으로 필요하지 않습니다.