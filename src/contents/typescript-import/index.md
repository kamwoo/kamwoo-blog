---
title: typescript import
published: true
category: typescript
subtitle: TypeScript 모듈 import 방법과 ambient 모듈 선언, namespace 사용 시 주의사항
date: 2022-07-22
---


전체 모듈을 단일 변수로 "./ZipCodeValidator"에서 export 되는 것들을 validator로 받아서 사용

```tsx
import * as validator from "./ZipCodeValidator";
let myValidator = new validator.ZipCodeValidator();
```


**다른 JavaScript 라이브러리와 함께 사용하기**

TS로 작성되지 않은 라이브러리의 형태를 설명하려면 라이브러리를 노출하는 API를 선언해야 한다.

구현되지 않은 선언은 “ambient”라고 부른다. 이 선언들을 일반적으로 .d.ts파일에 정의되어 있다.

**Ambient 모듈**

최상위 레벨로 내보내기 선언으로 각 모듈을 .d.ts 파일로 정의할 수 있지만, 더 큰 하나의 .d.ts 파일로 모듈들을 작성하는 것이 편리하다.

```tsx
declare module "url" {
    export interface Url {
        protocol?: string;
        hostname?: string;
        pathname?: string;
    }
    export function parse(urlStr: string, parseQueryString?, slashesDenoteHost?): Url;
}
```

url이라는 파일 정의?한다는 생각

```tsx
import * as URL from "url";
let myUrl = URL.parse("<http://www.typescriptlang.org>");
```

export하는 것들을 URL로 가져와서 사용

❕name space 주의점

- 모듈에서 네임스페이스를 export 하는 것은 너무 많은 중첩 레이어를 추가하는 예입니다,
    
    모듈을 사용할 때 추가적인 레벨의 간접 참조를 추가합니다. 이것은 사용자에게 금방 고통스러운 지점이 될 수 있고, 일반적으로 불필요합니다.
    
- **모듈에서 네임스페이스를 사용하지 마세요.**
    
- • 오직 최상위-레벨 선언만 `export namespace Foo { ... }`인 파일 (`Foo`를 제거하고 모든 것을 ‘상위’ 레벨로 이동하세요)
    
- • 최상위-레벨 위치에 동일한 `export namespace Foo {`를 가진 여러 파일 (하나의 `Foo`로 결합될 거라 생각하지 마세요!)