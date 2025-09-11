import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, fireEvent, fn } from 'storybook/test';
import Scrollable from './scrollable';
import './lazy-scrollable.stories.css';

const meta = {
  title: 'LazyScrollable',
  component: Scrollable,
  args: {
    showThumbOnHover: false,
    children: null,
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
      ],
    },
  },
} satisfies Meta<typeof Scrollable>;

export default meta;

type Story = StoryObj<typeof meta>;

const createRange = (
  start: number,
  end: number
) => Array.from({ length: end - start + 1 }).map((_, i) => start + i);

export const LazyScrollableByX: Story = {
  args: {
    wrapperStyle: {
      width: 1000,
      margin: '0 auto',
    },
    onLeftEdgeReached: fn(),
    onRightEdgeReached: fn(),
  },
  render: function Render({
    onRightEdgeReached,
    ...args
  }) {
    const [items, setItems] = useState(() => createRange(1, 10));
    const [isLoading, setIsLoading] = useState(false)
    return (
      <Scrollable
        {...args}
        onRightEdgeReached={async (event) => {
          onRightEdgeReached?.(event);
          // is loading
          if (isLoading) {
            return;
          }
          // max loaded items
          if (items.length >= 50) {
            return;
          }
          setIsLoading(true);
          await new Promise((resolve) => {
            setTimeout(resolve, 3000);
          })
          setItems([
            ...items,
            ...createRange(items.length + 1, items.length + 10)],
          );
          setIsLoading(false);
        }}
      >
        <div className="lazy-scrollable-by-x">
          {
            items.map((item) => (
              <div
                key={item}
                className="lazy-scrollable-by-x__item"
              >
                {item}
              </div>
            ))
          }
          {
            isLoading && (
              <div className="lazy-scrollable-by-x__item">
                loading...
              </div>
            )
          }
        </div>
      </Scrollable>
    )
  },
  async play({
    step,
  }) {
    await step('has horizontal scrollbars', async ({
      canvas,
    }) => {
      await waitFor(() => {
        expect(canvas.queryByRole('scrollbar', { name: 'vertical scrollbar' })).not.toBeInTheDocument();
        expect(canvas.queryByRole('scrollbar', { name: 'horizontal scrollbar' })).toBeInTheDocument();
      });
    });

    await step('scroll content horizontally using mouse wheel', async ({
      canvas,
      args,
    }) => {
      const scrollable = canvas.getByTestId('scrollable');
      const content = canvas.getByTestId('content');

      await expect(content).toBeInTheDocument();
      await expect(scrollable).toBeInTheDocument();

      const contentRect = content.getBoundingClientRect();
      const scrollableRect = scrollable.getBoundingClientRect();
      const scrollLeft = contentRect.width - scrollableRect.width;

      await fireEvent.scroll(scrollable, {
        target: {
          scrollLeft,
        },
      });

      await waitFor(async () => {
        await expect(args.onRightEdgeReached).toHaveBeenCalled();
      });

      await fireEvent.scroll(scrollable, {
        target: {
          scrollLeft: 0,
        },
      });

      await waitFor(async () => {
        await expect(args.onLeftEdgeReached).toHaveBeenCalled();
      });
    });
  }
}

export const LazyScrollableByY: Story = {
  args: {
    ...LazyScrollableByX.args,
    wrapperStyle: {
      width: 300,
      height: 300,
    },
    onTopEdgeReached: fn(),
    onBottomEdgeReached: fn(),
  },
  render: function Render({
    onBottomEdgeReached,
    ...args
  }) {
    const [items, setItems] = useState(() => createRange(1, 10));
    const [isLoading, setIsLoading] = useState(false)
    return (
      <Scrollable
        {...args}
        onBottomEdgeReached={async (event) => {
          onBottomEdgeReached?.(event);
          // is loading
          if (isLoading) {
            return;
          }
          // max loaded items
          if (items.length >= 50) {
            return;
          }
          setIsLoading(true);
          await new Promise((resolve) => {
            setTimeout(resolve, 3000);
          })
          setItems([
            ...items,
            ...createRange(items.length + 1, items.length + 10)],
          );
          setIsLoading(false);
        }}
      >
        <div className="lazy-scrollable-by-y">
          {
            items.map((item) => (
              <div
                key={item}
                className="lazy-scrollable-by-y__item"
              >
                {item}
              </div>
            ))
          }
          {
            isLoading && (
              <div className="lazy-scrollable-by-y__item">
                loading...
              </div>
            )
          }
        </div>
      </Scrollable>
    )
  },
  async play({
    step,
  }) {
    await step('has vertical scrollbar', async ({
      canvas,
    }) => {
      await waitFor(() => {
        expect(canvas.queryByRole('scrollbar', { name: 'vertical scrollbar' })).toBeInTheDocument();
        expect(canvas.queryByRole('scrollbar', { name: 'horizontal scrollbar' })).not.toBeInTheDocument();
      });
    });

    await step('scrolls content vertically using mouse wheel', async ({
      canvas,
      args,
    }) => {
      const scrollable = canvas.getByTestId('scrollable');
      const content = canvas.getByTestId('content');
      const scrollbarByY = canvas.getByRole('scrollbar', { name: 'vertical scrollbar' })!;

      await expect(scrollable).toBeInTheDocument();
      await expect(content).toBeInTheDocument();
      await expect(scrollbarByY).toBeInTheDocument();

      const contentRect = content.getBoundingClientRect();
      const scrollableRect = scrollable.getBoundingClientRect();
      const scrollTop = contentRect.height - scrollableRect.height;

      await fireEvent.scroll(scrollable, {
        target: {
          scrollTop,
        },
      });

      await waitFor(async () => {
        await expect(args.onBottomEdgeReached).toHaveBeenCalled();
      });

      await fireEvent.scroll(scrollable, {
        target: {
          scrollTop: 0,
        },
      });

      await waitFor(async () => {
        await expect(args.onTopEdgeReached).toHaveBeenCalled();
      });
    });
  }
}