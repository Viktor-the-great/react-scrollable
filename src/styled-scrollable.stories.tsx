import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { css } from '@emotion/css';
import Scrollable from './scrollable';
import { HorizontallyAndVerticallyScrollable } from './simple.stories';

const meta = {
  title: 'Examples/Styled',
  component: Scrollable,
  args: {
    showThumbOnHover: false,
    onLeftEdgeReached: fn(),
    onRightEdgeReached: fn(),
    onTopEdgeReached: fn(),
    onBottomEdgeReached: fn(),
  },
  argTypes: {
    showThumbOnHover: {
      options: [false, true],
      control: { type: 'radio' },
    },
  },
  parameters: {
    controls: {
      exclude: [
        'children',
        'className',
        'style',
        'wrapperStyle',
      ],
    },
  },
} satisfies Meta<typeof Scrollable>;

export default meta;


type Story = StoryObj<typeof meta>;

export const DefaultScrollbars: Story = {
  args: {
    ...HorizontallyAndVerticallyScrollable.args,
  },
  render({
    children,
    ...args
  }) {
    return (
      <Scrollable
        {...args}
        className={css({
          width: 300,
          height: 300,
        })}
      >
        {children}
      </Scrollable>
    )
  }
}

export const CustomScrollbarsVariant1: Story = {
  ...DefaultScrollbars,
  render({
    children,
    ...args
  }) {
    return (
      <Scrollable
        {...args}
        className={css({
          width: 300,
          height: 300,
          '--thumb-size': '10px',
          '--thumb-background': 'cyan',
          '--thumb-border-radius': '5px',
          '--scrollbar-border': '1px solid cyan',
          '--scrollbar-border-radius': '5px',
        })}
      >
        {children}
      </Scrollable>
    )
  }
}


export const CustomScrollbarsVariant2: Story = {
  ...DefaultScrollbars,
  render({
    children,
    ...args
  }) {
    return (
      <Scrollable
        {...args}
        className={css({
          '--thumb-size': '10px',
          '--thumb-background': 'cyan',
          '--thumb-border-radius': '5px',
          '--scrollbar-background': '#C7CED480',
          '--scrollbar-border-radius': '5px',
        })}
      >
        {children}
      </Scrollable>
    )
  }
}