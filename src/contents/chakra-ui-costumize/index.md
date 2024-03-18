---
title: chakra ui - customize theme
published: true
category: react
subtitle: chakra ui custom
date: 2024-02-13
---
기본적으로 모든 chakra ui의 컴포넌트는 default theme을 따르지만

아래와 같은 요구사항이 있다면 커스텀할 수 있다.

- colors, font size, line height 등의 theme token이 필요한 경우
- 컴포넌트의 스타일, 사이즈, variant의 변경이 필요한 경우
- 전역 스타일의 변경이 필요한 경우

### theme token

default theme에서 colors를 정의한 것과 같다.

```jsx
import { extendTheme } from '@chakra-ui/react'

const colors = {
	brand: {
		100: "#q328',
	}
}

const theme = extendTheme({ colors })

---
<Button colorScheme={brand}></Button>
```

### Compoenent styles

메인 컨셉

1. 컴포넌트는 default 또는 base styles을 가진다.
2. size를 스타일링 한다.
3. variant를 스타일링 한다.

추가로 defualtProps는 colorScheme, size, variant를 설정할 수 있다.

(구조)

```jsx
import { ComponentStyleConfig } from "@chakra-ui/react"

const ComponentSytle: ComponenetStyleConfig = {
	baseStyle: {},
	sizes: {},
  variants: {},

	defaultProps:{
		colorScheme: "",
		size: "",
		variant: "",
	}
}
```

**Single Component**

theme을 스타일링하거나 덮어쓰는 경우에 하나의 part로 구성된 단일 컴포넌트인지 확인해야한다. 아니라면 스타일링하면서 영향을 받는 각 part의 이름을 지정해야한다.

```jsx
import { extendTheme } from "@chakra-ui/react"
import type { StyleFunctionProps } from "@chakra-ui/styled-system"

const Button: {
	baseStyle: {
		fontWeight: 'bold'
	},
	sizes: {
		xl: {
			height: "56px",
			fontSize: "lg",
			paddingX: "32px"
		}
	},
	variants: {
		solid: {
			bg: "#fff"
			boxShadow: "0 0 2px 2px #000"
		},
		ghost: ({colorMode}: StyleFunctionProps) => ({
			bg: colorMode === 'light' ? "#fff" : "#000"
		}),
		// 반응형도 설정 가능
		sm: {
			bg: "blue.400",
			fontSize: "sm",
		}
	}
	defualtProps: {
		size: 'xl',
		variant: 'solid',
		colorScheme: 'gray'
	}
}

const theme = extendTheme({ components: { Button } })
or
const theme = extendTheme({ components: { Button: defineStyleConfig({ ...Button }) }})
// Button은 이미 chakra에 있어서 위처럼도 쓸 수 있지만
// Card와 같은 경우에는 새로 정의된 컴포넌트이기 때문에 defineStyleConfig를 사용해야한다.
```

**Global Styles**

전역 html element를 스타일링할 수 있다.

```jsx
import { extendTheme } from "@chakra-ui/react"

const global = {
	body: {
		bg: 'white',
		color: 'f000'
	},
	a: {
		color: 'f000'
	}
}

const theme = extendTheme({ styles: { global } })
```

### extensions

**withDefaultColorScheme**

선택한 모든 컴포넌트에 default colorScheme을 먹일 수 있다.

```jsx
import { extendTheme, withDefaultColorScheme } from '@chakra-ui/react'

const customTheme = extendTheme(
  withDefaultColorScheme({
    colorScheme: 'red',
    components: ['Button', 'Badge'],
  }),
  withDefaultColorScheme({
    colorScheme: 'blue',
    components: ['Alert', 'Table'],
  }),
)
```

**withDefaultSize**

선택한 모든 컴포넌트에 default size를 먹일 수 있다.

```jsx
import { extendTheme, withDefaultSize } from '@chakra-ui/react'

const customTheme = extendTheme(
  withDefaultSize({
    size: 'lg',
    components: ['Button', 'Badge'],
  }),
)
```

**withDefaultVariant**

```jsx
import { extendTheme, withDefaultVariant } from '@chakra-ui/react'

const customTheme = extendTheme(
  withDefaultVariant({
    variant: 'outline',
    components: ['Input', 'NumberInput', 'PinInput'],
  }),
)
```

**withDefaultProps**

```jsx
import { extendTheme, withDefaultProps } from '@chakra-ui/react'

const customTheme = extendTheme(
  withDefaultProps({
    defaultProps: {
      variant: 'outline',
      size: 'lg',
    },
    components: ['Input', 'NumberInput', 'PinInput'],
  }),
)
```
