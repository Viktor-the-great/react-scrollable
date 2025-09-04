import { type CSSProperties, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, waitFor } from 'storybook/test';
import useResizeObserver from './useResizeObserver';

type ButtonPropsType = {
  style: CSSProperties;
  onClick?: () => void;
}

const meta = {
  component: function Component(props) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<CSSProperties>(props.style);
    useResizeObserver({
      elementRef,
      onChange,
    });

    const onClick = () => {
      setStyle({
        width: style.width ? parseInt(style.width.toString()) * 2 : 0,
        height: style.height ? parseInt(style.height.toString()) * 2 : 0,
      })
    };

    return (
      <div
        role="button"
        ref={elementRef}
        onClick={onClick}
        style={style}
      />
    );
  },
  tags: ['!dev'],
} satisfies Meta<ButtonPropsType>;
export default meta;

const onChange = fn();
type ButtonStory = StoryObj<typeof meta>;
export const Button: ButtonStory = {
  args: {
    style: {
      width: 10,
      height: 10,
    }
  },
  async play({
    userEvent,
    canvas,
  }) {
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        width: 10,
        height: 10,
      });
    }, { timeout: 1000 });

    const button = await canvas.findByRole('button');
    await userEvent.click(button);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        width: 20,
        height: 20,
      });
    }, { timeout: 1000 });
  },
} satisfies ButtonStory;