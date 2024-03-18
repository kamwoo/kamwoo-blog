---
title: chakra ui - component style
published: true
category: react
subtitle: chakra ui customize component
date: 2024-02-14
---

일관된 theme은 컴포넌트 스타일링을 유지하고 이해하기 쉽게 만든다.

## base style과 modifier style

대부분의 컴포넌트는 기본이 되는 **base style**과 상태나 속성에 따라서 변경되는 **modifier style**로 구성된다.

- base style
    - baseStyle
- modifier style
    - size
    - variant
    - color scheme
    - color mode

## Single part와 Multipart 컴포넌트

single part 컴포넌트는 단일 element를 반환하는 컴포넌트를 말한다. ex) button, badge

multipart 컴포넌트는 여러 element로 구성된 컴포넌트를 말한다. ex) modal, menu

### single part

single part 컴포넌트는 baseStyle, size, variant로 style을 정의하고 theme을 extend할 수 있다.

[**Single Component**](https://www.notion.so/Single-Component-85a562981a4a472fae3d7a8d0c269023?pvs=21)

**defineStyleConfig**

Button은 이미 chakra에 있어서 위처럼도 쓸 수 있지만, Card와 같은 경우에는 새로 정의된 컴포넌트이기 때문에 defineStyleConfig를 사용해야한다.

예를 들어서 아래와 같은 Card라는 스타일을 정의한다.

```jsx
const Card = defineStyleConfig({
  baseStyle: {},
  variants: {
    smooth: {},
  },
  defaultProps: {
    variant: 'smooth',
  },
})

const theme = extendTheme({ components: { Card }})
```

이거는 스타일을 정의한 것이지 컴포넌트를 정의한 것이 아니다. 따라서 해당 스타일을 사용하기 위해서는 `useStyleConfig` hook을 사용해서 다른 컴포넌트(Box 등)에 집어 넣는다.

```jsx
import { Box, useStyleConfig } from '@chakra-ui/react'

const Card = (props: { size, variant, colorScheme }) => {
  const { variant, ...rest } = props
  const styles = useStyleConfig('Card', { variant })

  return <Box __css={styles} {...rest} />
}
```

♨︎ __css는 우선순위가 낮아서 override하기 쌉가능

### Multipart

single part와 굉장히 유사하지만 몇가지가 다르다.

- 각 part들을 정의하고 `createMultiStyleConfigHelper` 로 전달한다.
- 각 part들에 baseStyle, sizes, variants을 전달해야한다.

예시)

```jsx
import { extendTheme } from "@chakra-ui/react"
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system"

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers(['menu', 'item'])

const Menu = defineMultiStyleConfig({
	baseStyle: {
		menu: {}
		item: {}
	},
	sizes: {
		sm: {
			item:{}
		},
		md: {
			item: {}
		}
	},
	variants: {
		solid: {
			menu: {},
			item: {},
		}
	},
	defualtProps: {
		size: 'md'
	}
})

const theme = extendTheme({ components: { Menu } })
```

```jsx
import { createStylesContext, useMultiStyleConfig } from "@chakra-ui/react"

const [ useStyles, StylesProvider ] = createStyleContext('Menu')

const Menu = (props) => {
	const { size, variant, children} = props
	const styles = useMultiStyleConfig("Menu", { size, variant })

	return (
		<Box __css={styles.menu}>
			<StylesProvider value={styles}>
				{children}
			</StylesProvider>
		</Box>
	)
}

const MenuItem = (props) => {
	const styles = useStyles()

	return (
		<Box __css={styles.item} {...props} ></Box>
	)
}
```

compound component 패턴으로 만들기 개좋네