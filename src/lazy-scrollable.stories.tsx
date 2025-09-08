import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, fireEvent, fn } from 'storybook/test';
import Scrollable from './scrollable';
import './lazy-scrollable.stories.css';

const meta = {
  title: 'LazyScrollable',
  component: Scrollable,
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

export const LazyScrollableByX: Story = {
  args: {
    style: {
      width: 1000,
      margin: '0 auto',
    },
    onScroll: fn(),
    showThumbOnHover: false,
    children: null,
  },
  render: function Render({
    onScroll,
    ...args
  }) {
    const createRange = (
      start: number,
      end: number
    ) => Array.from({ length: end - start + 1 }).map((_, i) => start + i);
    const [items, setItems] = useState(() => createRange(1, 10));
    const [isLoading, setIsLoading] = useState(false)
    return (
      <Scrollable
        {...args}
        onScroll={async (event) => {
          await onScroll?.(event);
          // is loading
          if (isLoading) {
            return;
          }
          // max loaded items
          if (items.length >= 50) {
            return;
          }
          if (!event.isVertical && event.is_right_edge_reached) {
            setIsLoading(true);
            await new Promise((resolve) => {
              setTimeout(resolve, 3000);
            })
            setItems([
              ...items,
              ...createRange(items.length + 1, items.length + 10)],
            );
            setIsLoading(false);
          }
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
      const scrollable = canvas.getByTestId('scrollable-wrapper');
      const content = canvas.getByTestId('scrollable-content');

      await expect(content).toBeInTheDocument();
      await expect(scrollable).toBeInTheDocument();

      const contentRect = content.getBoundingClientRect();
      const scrollableRect = scrollable.getBoundingClientRect();
      const contentScrollLeft = contentRect.width - scrollableRect.width;

      await fireEvent.wheel(content, {
        deltaX: 0,
        deltaY: contentScrollLeft,
        shiftKey: true,
      });

      await waitFor(async () => {
        await expect(args.onScroll).toHaveBeenLastCalledWith({
          isVertical: false,
          scrollLeft: contentScrollLeft,
          is_left_edge_reached: false,
          is_right_edge_reached: true,
        });
      });

      await fireEvent.wheel(content, {
        deltaX: 0,
        deltaY: -contentScrollLeft,
        shiftKey: true,
      });

      await waitFor(async () => {
        await expect(args.onScroll).toHaveBeenLastCalledWith({
          isVertical: false,
          scrollLeft: 0,
          is_left_edge_reached: true,
          is_right_edge_reached: false,
        });
      });
    });
  }
}

export const LazyScrollableByY: Story = {
  args: {
    ...LazyScrollableByX.args,
    style: {
      width: 300,
      height: 300,
    },
    onScroll: fn()
  },
  render: function Render({
    onScroll,
    ...args
  }) {
    const createRange = (
      start: number,
      end: number
    ) => Array.from({ length: end - start + 1 }).map((_, i) => start + i);
    const [items, setItems] = useState(() => createRange(1, 10));
    const [isLoading, setIsLoading] = useState(false)
    return (
      <Scrollable
        {...args}
        onScroll={async (event) => {
          await onScroll?.(event);
          // is loading
          if (isLoading) {
            return;
          }
          // max loaded items
          if (items.length >= 50) {
            return;
          }
          if (event.isVertical && event.isBottomEdgeReached) {
            setIsLoading(true);
            await new Promise((resolve) => {
              setTimeout(resolve, 3000);
            })
            setItems([
              ...items,
              ...createRange(items.length + 1, items.length + 10)],
            );
            setIsLoading(false);
          }
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
      const scrollable = canvas.getByTestId('scrollable-wrapper');
      const content = canvas.getByTestId('scrollable-content');
      const scrollbarByY = canvas.getByRole('scrollbar', { name: 'vertical scrollbar' })!;

      await expect(scrollable).toBeInTheDocument();
      await expect(content).toBeInTheDocument();
      await expect(scrollbarByY).toBeInTheDocument();

      const contentRect = content.getBoundingClientRect();
      const scrollableRect = scrollable.getBoundingClientRect();
      const contentScrollTop = contentRect.height - scrollableRect.height;

      await fireEvent.wheel(content, {
        deltaX: 0,
        deltaY: contentScrollTop,
      });

      await waitFor(async () => {
        await expect(args.onScroll).toHaveBeenLastCalledWith({
          isVertical: true,
          scrollTop: contentScrollTop,
          isTopEdgeReached: false,
          isBottomEdgeReached: true,
        });
      });

      await fireEvent.wheel(content, {
        deltaX: 0,
        deltaY: -contentScrollTop,
      });

      await waitFor(async () => {
        await expect(args.onScroll).toHaveBeenLastCalledWith({
          isVertical: true,
          scrollTop: 0,
          isTopEdgeReached: true,
          isBottomEdgeReached: false,
        });
      });
    });
  }
}