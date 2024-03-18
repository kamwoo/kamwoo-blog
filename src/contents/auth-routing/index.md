---
title: auth routing
published: true
category: next
subtitle: 권한에 따른 페이지 접근 제어
date: 2023-05-17
---
## 개요

> 프론트에서 권한에 따른 페이지 접근을 제어하기 위한 라우팅을 어떻게 구현하고 관리할 것인지 고민

## 시도 1. (middleware)

Next.js에서 제공하는 middleware를 사용해서 권한에 따른 리다이렉션

<img src="/images/posts/auth-routing/routing1.png" />

### 상세 구현 내용

- Enablement Activation을 확인하는 API를 콜해서 응답받은 데이터를 사용
    
- `isLogin`, `isActivated` 변수를 조건으로 상황에 따른 리다이렉트
	
	<img src="/images/posts/auth-routing/routing2.png" />
    

middleware.ts

```tsx
// check하고 하는 request url 
export const config = {
  matcher: ["/", "/control/:path*", "/enablement/:path*", "/login/:path*", "/manage/:path*"],
};

export default async function middleware(request: NextRequest) {
	...
  
  // 1. 쿠키에 session_id가 없으면 바로 로그인 페이지로 리다이렉트
  if (!cookie || !cookie.includes("session_id")) {
    if (request.nextUrl.pathname.startsWith("/login")) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { code, result } = await getActivation(cookie || "");
    const isLogin = ![401001].includes(code);
    const isActivated = result["is_activated"];

		// 2. login 페이지로 접근했을 때
    if (request.nextUrl.pathname.startsWith("/login")) {
      if (isLogin && isActivated) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      if (isLogin && !isActivated) {
        const url = getRedirectURL("/enablement/license", request.url, "/");
        return NextResponse.redirect(url);
      }

      if (!isLogin && isActivated) {
        return NextResponse.next();
      }

      if (!isLogin && !isActivated) {
        return NextResponse.next();
      }
    }
	
		// 3. enablement 페이지로 접근했을 때
    if (request.nextUrl.pathname.startsWith("/enablement")) {
      if (isLogin && isActivated) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      if (isLogin && !isActivated) {
        return NextResponse.next();
      }

      if (!isLogin && isActivated) {
        const url = getRedirectURL("/login", request.url, "/");
        return NextResponse.redirect(url);
      }

      if (!isLogin && !isActivated) {
        const url = getRedirectURL("/login", request.url, "/enablement/license");
        return NextResponse.redirect(url);
      }
    }
		
		// 4. 그 외 페이지로 접근했을 때
    if (isLogin && isActivated) {
      return NextResponse.next();
    }

    if (isLogin && !isActivated) {
      const url = getRedirectURL("/enablement/license", request.url, "/");
      return NextResponse.redirect(url);
    }

    if (!isLogin && isActivated) {
      const url = getRedirectURL("/login", request.url, "/");
      return NextResponse.redirect(url);
    }

    if (!isLogin && !isActivated) {
      const url = getRedirectURL("/login", request.url, "/enablement/license");
      return NextResponse.redirect(url);
    }
  } catch (e) {
		// 5. 에러가 발생한 경우 에러 페이지로 리다이렉트
    const error = e as CustomError;

    if (error.data) {
      return NextResponse.redirect(
        new URL(
          `/_error?errorCode=${error.data.code}&errorMessage=${error.data.message}&redirectURL=${request.nextUrl.pathname}`,
          request.url
        )
      );
    }

    return NextResponse.redirect(new URL(`/_error?errorCode=500&redirectURL=${request.nextUrl.pathname}`, request.url));
  }
```

### 문제 사항

1. URL 캐싱 때문에 페이지가 변경될 때마다 실행되지 않는다.

## 시도 2. (server side)

`getServerSideProps` 를 사용해서 매 페이지 실행마다 서버에서 리다이렉트

### 상세 구현 내용

auth-router.ts

```tsx
import { type GetServerSidePropsContext, type Redirect } from "next";

import { getAuthConditions } from "./get-auth-conditions";

type GetRoute = (request: GetServerSidePropsContext["req"]) => Promise<Response>;

type Response =
  | { redirect?: Redirect; redirectURL?: string; props: Record<string, never> }
  | { props: Record<string, never> };

export const authRouter: GetRoute = async (request) => {
  const { isLoggedIn, isActivated, error } = await getAuthConditions();

  if (error) {
    return response.redirect(`/_error?errorCode=${error.code}&errorMessage=${error.message}`);
  }
	
	// 이하 middleware와 조건부 라우팅 로직과 같음
  // ...

const response = {
  next: () => ({
    props: {},
  }),

  redirect: (url: string) => ({
    redirect: {
      destination: url,
      permanent: false,
    },
    props: {},
  }),
};
```

page.tsx

```tsx
const Page = () => {
  return (
    <></>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  return await authRouter(req);
};

export default Page;
```

### 문제 사항

1. 모든 페이지마다 `getServerSideProps` 를 작성해줘야 하는 번거로움이 있다.
2. 페이지를 이동할 때마다 서버로 요청이 간다.

## 다른 방법. (HOC)

페이지 컴포넌트를 감싸는 고차 컴포넌트를 사용해서 이동마다 리다이렉트를 실행

(카카오 페이 증권에서는 해당 방식 사용)

에러 상황에 따라 모달 등 UI 대처의 폭이 넓어진다.

### 문제 사항

1. 페이지가 로드되고 리다이렉트가 발생하므로 잠시 해당 페이지가 보여서 UX 적으로 좋지 않다.
    
    (flickering issue?)
    

### 문제 개선 방법

- HOC에서 로직을 수행하는 지연 시간 동안 로딩 UI를 보여준다.

## 결론

Server Side에서 리다이렉트 시키는 것으로 결정

이유

1. 깜빡이는 문제 또는 페이지 이동간 로딩 UI를 넣는 것은 UX상 좋지 않음
2. 페이지 이동마다 서버로 요청이 가는 것은 현재 프로덕트에서 성능상 크게 문제되지 않음
