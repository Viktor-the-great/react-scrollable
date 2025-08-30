# Scrollable component

Scrollable is a custom component made to handle scrolling with a custom scrollbar. 

## Features:
* render custom vertical/horizontal thumb
* support mouse pointer
* support touch pointer
* support accessibility
* can show thumbs on mouse hover and hide on mouse leave

## Installation
`npm install @v.voloshin/react-scrollable`

## Usage
```js
import Scrollable from '@v.voloshin/react-scrollable'

function ScrollableText({
  children,
}) {
    return (
      <Scrollable>
        {children}
      </Scrollable>
    )
}
```

## Scrollbar props
| Prop              | Description                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| children          | content of scrollable area                                                  |
| showThumbOnHover  | show thumbs on mouse hover, effects only for pointing devices like a mouse  |
| children          | content of scrollable area                                                  |
| style             | use styles to customize element styles                                      |
