import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { css } from '@emotion/css';
import Scrollable from './scrollable';
import vDragUrl from './assets/v-drag.svg';
import hDragUrl from './assets/h-drag.svg';
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
    classNames: {
      scrollable: css({
        width: 300,
        height: 300,
      }),
    },
  },
}

export const CustomScrollbarsVariant1: Story = {
  ...DefaultScrollbars,
  args: {
    ...DefaultScrollbars.args,
    classNames: {
      scrollable: css({
        width: 300,
        height: 300,
        '--thumb-size': '10px',
        '--thumb-background': 'cyan',
        '--thumb-border-radius': '5px',
        '--scrollbar-border': '1px solid cyan',
        '--scrollbar-border-radius': '5px',
      }),
    },
  },
}


export const CustomScrollbarsVariant2: Story = {
  ...DefaultScrollbars,
  args: {
    ...DefaultScrollbars.args,
    classNames: {
      scrollable: css({
        '--thumb-size': '10px',
        '--thumb-background': 'cyan',
        '--thumb-border-radius': '5px',
        '--scrollbar-background': '#C7CED480',
        '--scrollbar-border-radius': '5px',
      }),
    },
  },
}

export const CustomScrollbarsVariant3: Story = {
  ...DefaultScrollbars,
  args: {
    ...DefaultScrollbars.args,
    classNames: {
      scrollbar: ({
        isVertical,
      }) => {
        const baseCls = css({
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            zIndex: -1,
            borderRadius: 5,
          },
          '&:hover': {
            '&::before': {
              backgroundColor: 'rgba(0, 0, 0, 0.16)',
            },
          }
        })
        if (isVertical) {
          return [
            baseCls,
            css({
              '&::before': {
                top: 0,
                bottom: 0,
                left: 5,
                right: 5,
              }
            }),
          ];
        }
        return [
          baseCls,
          css({
            '&::before': {
              top: 5,
              bottom: 5,
              left: 0,
              right: 0,
            }
          }),
        ];
      },
      thumb: ({
        isVertical,
      }) => {
        const baseCls = css({
          borderRadius: 8,
          backgroundColor: '#efb436',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 14,
          '&:hover': {
            backgroundColor: '#e6a722',
          }
        })
        if (isVertical) {
          return [
            baseCls,
            css({
              width: 16,
              backgroundImage: `url("${vDragUrl}")`,
            }),
          ]
        }
        return [
          baseCls,
          css({
            height: 16,
            backgroundImage: `url("${hDragUrl}")`,
          }),
        ]
      },
    }
  },
}