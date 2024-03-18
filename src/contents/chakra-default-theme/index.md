---
title: chakra ui - default theme(Foundation)
published: true
category: react
subtitle: chakra ui foundation
date: 2024-02-12
---
theme object에 아래 사항을 정의한다

- color palette
- type scale
- font stacks
- break points
- border radius
- 등등

### Colors

`theme.colors` 는 `color`, `borderColor`, `backgroundColor`, `fill`, `stroke` 등이 참조한다.

```jsx
import { extendTheme } from '@chakra-ui/react'

const	colors = {
		purple: {
			50: '#f7fafc',
      // ...
      900: '#171923',
		}
	}

const theme = extendTheme({ colors })
```

### Typography

fonts, fontSizes, fontWeights, lineHeights, letterSpacings 등의 옵션이 존재

```jsx
import { extendsTheme } from "@chakra-ui/react"

const	fonts = {
		body: 'sens-serif',
		heading: 'Georgia, serif',
	}

const	fontSizes = {
		xs: '0.75rem'
	}

const	fontWeights = {
		light: 300
	}

const	lineHeights = {
		short: "1.375rem"
	}

const	letterSpacings = {
		wide: "0.025"
	}

const theme = extendTheme({ fonts, fontSizes, fontWeights, lineHeights, letterSpacings })
```

### Space

padding, margin, top, left, right, bottom의 참조로 사용된다.

```jsx
import { extendTheme } from '@chakra-ui/react'

const space = {
	px: '1px',
	0.5: '0.125rem'
	...
}

const theme = extendTheme({ space })
```

### Sizes

Width, height, maxWidth, minWidth, maxHeight, minHeight의 참조로 사용된다.

```jsx
import { extendTheme } from '@chakra-ui/react'

const sizes = {
	full: '100%',
	xs: '20rem',
	...
}

const theme = extendTheme({ sizes })
```

### Breakpoints

반응형 기준

```jsx
import { extendTheme } from '@chakra-ui/react'

const breakpoints = {
	sm: '30rem',
	...
}

const theme = extendTheme({ breakpoints })
```

그 밖에

- Border radius = radii
- z-index = zIndices

### Config

global settings를 설정할 수 있다.

- cssVarPrefix: 보통 사용할 때 chakra.으로 사용하는데 ck 등으로 변경할 수 있다.
- initialColorMode: 앱 시작할 때, 컬러 모드 설정
- useSystemColorMode: 시스템 환경설정을 사용해서 chakra system을 업데이트 할 수 있다.
