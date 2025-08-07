import { forwardRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn, expect, waitFor } from 'storybook/test';
import useResizeObserver from './useResizeObserver';

type ButtonPropsType = {
  width: number;
  height: number;
  onClick?: () => void;
}

const ButtonComponent = forwardRef<HTMLButtonElement, ButtonPropsType>(function ButtonComponent({
  width,
  height,
  onClick,
}: ButtonPropsType, ref) {
  return (
    <button
      ref={ref}
      style={{
        width,
        height,
        padding: 0,
      }}
      onClick={onClick}
    />
  );
});

const meta = {
  component: ButtonComponent,
  tags: ['!dev'],
} satisfies Meta<ButtonPropsType>;
export default meta;

const onChange = fn();
type ButtonStory = StoryObj<typeof meta>;
export const Button: ButtonStory = {
  args: {
    width: 10,
    height: 10,
  },
  render: function Render(args) {
    const [width, setWidth] = useState(args.width);
    const [height, setHeight] = useState(args.height);
    const [containerRef] = useResizeObserver<HTMLButtonElement>({
      onChange,
    });

    const onClick = () => {
      setWidth(width * 2);
      setHeight(width * 2);
    };

    return (
      <ButtonComponent
        ref={containerRef}
        onClick={onClick}
        width={width}
        height={height}
      />
    );
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