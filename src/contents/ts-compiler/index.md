---
title: ts compiler
published: true
category: typescript
subtitle: A set of two-state buttons that can be toggled on or off
date: 2022-08-02
---

### 타입스크립트 컴파일러 역할

1. 코드의 타입 오류를 체크한다.
2. 최신 자스/타스를 모든 브라우저에서 동작할 수 있도록 구버전의 자스로 트랜스 파일한다.
3. 컴파일은 타입체크와 독립적으로 동작한다.
4. 모든 triple-slash 참조 지시어를 분석하기 위해서 전처리를 수행한다.

### Babel vs tsc

빌드 출력 결과와 소스 입력 파일이 거의 비슷한가

→ tsc

여러 잠재적인 결과물을 내는 빌드 파이프라인이 필요한가

→ babel로 트랜스파일, tsc로 타입 검사