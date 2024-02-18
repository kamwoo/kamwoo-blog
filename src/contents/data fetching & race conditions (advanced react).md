---
title: data fetching & race conditions (advanced react)
date: 2024-02-14
published: true
category: react
subtitle: A set of two-state buttons that can be toggled on or off
---

## keywords

---

- Promise race
- race condition problem

## contents

---

문제상황 - Race condition

위 페이지에서 왼쪽 버튼을 빠르게 변경하면 fetching을 계속하고 response를 응답이 받을 때마다 렌더링된다. 또한 Issue 1이 보다 늦게 응답이 온다면 issue2 페이지에서 issue1의 내용을 보게된다.

[화면 기록 2024-01-26 오전 11.00.46.mov](https://prod-files-secure.s3.us-west-2.amazonaws.com/f33f1550-130f-4c4d-a8c4-0590640fbf06/0c2fbe6f-069b-4493-a722-82a00fe07930/%E1%84%92%E1%85%AA%E1%84%86%E1%85%A7%E1%86%AB_%E1%84%80%E1%85%B5%E1%84%85%E1%85%A9%E1%86%A8_2024-01-26_%E1%84%8B%E1%85%A9%E1%84%8C%E1%85%A5%E1%86%AB_11.00.46.mov)

해결 방법

1. force re-mounting
    
    ```jsx
    const App = () => {
    	const [page, setPage] = useState('issue');
    
    	return ( 
    		<>
          {page === 'issue' && <Issue />}
          {page === 'about' && <About />}
        </>
    	); 
    };
    ```
    
    `<Issue>` , `<Aboute>` 컴포넌트 내부에서 fetching
    
    컴포넌트 re-mount로 이전 컴포넌트가 unmount되면, 이전에 요청하던 fetching의 Promise 콜백의 상태를 사용하는 코드도 동작하지 않는다.
    
    비슷한 멍청했던 경험
    
    ```tsx
    const { mutate: updateSettings } = useUpdateSettings({
        onSuccess: () => {
          queryClient.invalidateQueries(displayQueryKeys.settings());
          updateLayout({ displayId, viewId, layout: changedWidgetListRef.current });
    			rest.onClose(); // <- updateLayout 실행하고 닫아서
        },
        onError: (error) => {
          handleError(error);
          warningToast();
        },
      });
    
    const { mutate: updateLayout } = useUpdateLayout({
      onSuccess: () => { // <- 실행 안됨
        queryClient.invalidateQueries(displayQueryKeys.viewMode({ displayId, viewId }));
      },
      onError: (error) => {
        handleError(error);
        warningToast();
      },
    });
    ```
    
2. drop incorrect result
    
    ref에 id를 넣어서 url이랑 비교해서 같으면 업데이트하는 방식
    
    ```jsx
    const Page = ({ id }) => {
    	const ref = useRef(id);
    
    	useEffect(() => {
    		ref.current = url;
    
    		fetch(`/some-data-url/${id}`)
    			.then((result) => {
    				if (result.url === ref.current) {
    					result.json().then((r) => { setData(r);
    				}); 
    			}
        });
      }, [url]);
    };
    ```
    
3. drop all previous results
    
    위 방식 이상하다. useEffect의 cleanup 함수 이용 방식
    
    Unmout, re-rendering 전에 조건을 변경한다.
    
    _useEffect_(() => {_// set this closure to "active"_ let isActive = true;
    
    _fetch_(`/some-data-url/${id}`) ._then_((r) => r._json_()) ._then_((r) => {
    
    ```
          // if the closure is active - update state
    
    ```
    
    if (isActive) { _setData_(r);
    
    } });
    
    return () => {_// set this closure to not active before next re-render_ isActive = false;
    
    }; }, [id]);
    
4. cancel all previous requests
    
    fetch options에 signal이라고 필드가 있는데, 이것을 위와 같이 이용하는 예제
    
    /call
    
    ```jsx
    useEffect(() => {
    	const controller = new AbortController();
    
    	fetch(url, { signal: controller.signal }) 
    		.then((r) => r.json())
    		.then((r) => {
    			setData(r); 
    		});
    
    	return () => {
    		controller.abort();
    	};
    }, [url]);
    ```
    

---

위 방식들 중에서는 컴포넌트를 나누고, 컴포넌트 내부에서 fetching하는게 가장 이상적이라고 생각.

suspense 사용할 때도 waterfall 때문에 컴포넌트를 잘분리하는 것이 중요하고, 내부에서 필요한 데이터를 fetching하는 것이 코드를 읽거나, 디버깅에 용이하다고 생각함
