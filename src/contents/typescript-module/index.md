---
title: typescript module
published: true
category: typescript
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-06-29
---

<div align="center">
<img src="/images/posts/typescript-module/1.png" />
</div>


es6부터 javascript에 모듈 개념이 생겼고 typescript도 따라간다.

모듈은 모듈 로더를 사용해서 가져오고, 잘 알려진 모듈 로더는 node.js 로더와 requireJS 로더가 있다.

모듈은 선언적이다. 모듈 간의 관계는 파일 수준에서 가져오기 및 내보내기 측면에서 지정된다.

## import

```tsx
// Re-using the same import
import { APIResponseType } from "./api";

// Explicitly use import type
import type { APIResponseType } from "./api";

// Explicitly pull out a value (getResponse) and a type (APIResponseType) 
import { getResponse, type APIResponseType} from "./api";
```

import type처럼 사용해서 type을 가져오는 것이라고 명시할 수 있다.

## d.ts

구현을 정의하지 않는 선언을 "ambient"라고 부릅니다. 일반적으로 `.d.ts`파일에 정의되어 있습니다.

`.d.ts`최상위 내보내기 선언을 사용 하여 자체 파일에 각 모듈을 정의할 수 있지만 하나의 큰 `.d.ts`파일로 작성하는 것이 더 편리합니다.

```tsx
// node.d.ts
declare module "url" {
  export interface Url {
    protocol?: string;
    hostname?: string;
    pathname?: string;
  }
  export function parse(
    urlStr: string,
    parseQueryString?,
    slashesDenoteHost?
  ): Url;
}
```

triple-trash directive 이용