---
title: triple-slash directives
published: true
category: typescript
subtitle: TypeScript triple-slash directives를 사용한 파일 참조, 타입 참조, 라이브러리 참조 방법
date: 2022-08-01
---

> 단일 XML 태그를 포함한 한 줄 주석
> 
> 선언 패키지의 import로 간주할 수 있다.

컴파일러에게 추가 파일을 컴파일 과정에 포함할 것을 지시한다.

# **/// <reference path="..." />**

파일 간의 의존성 선언으로 사용된다.

컴파일러에게 추가 파일을 컴파일 과정에 포함할 것을 지시한다.

### 특징

- 포함한 파일의 상단에서만 유효하다.
- 문자나 선언 뒤에 나오면 보통 한 줄 주석으로 여겨지며 특별한 의미를 갖지 않는다.

# **/// <reference types="..." />**

`/// <reference types="node" />` 는 `@types/node/index.d.ts` 에 선언된 이름을 사용한다는 의미이다. 따라서 패키지는 선언 파일과 함께 컴파일에 포함된다.

### 특징

- d.ts 파이을 직접 작성할 때만 사용해야한다.
- 오직 결과 파일이 참조된 패키지의 선언문을 사용하는 경우에만 생성된 파일 안에 추가된다.

# **/// <reference lib="..." />**

파일이 명시적으로 기존 내장 lib 파일을 포함하게 한다.

`/// <reference lib="es2017.string" />` 는

`-lib es2017.string` 으로 컴파일하는 것과 같다.

# **/// <reference no-default lib="true"/>**

컴파일러 기본 라이브러리를 컴파일에 포함시키지 않도록 지시한다.

# **/// <amd-module />**

컴파일러에게 선택적으로 모듈 이름을 넘길 수 있도록 해준다.

# **/// <amd-dependency />**

`/// <amd-dependency path="x" />`는 컴파일러에게 결과 모듈의 require 호출에 추가해야 하는 TS가 아닌 모듈의 의존성에 대해 알려줍니다.