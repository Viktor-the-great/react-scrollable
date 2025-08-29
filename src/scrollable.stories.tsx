import type { Meta, StoryObj } from '@storybook/react-vite';

import Scrollable from './scrollable';

const meta = {
  title: 'Scrollable',
  component: Scrollable,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Scrollable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ScrollableStory: Story = {
  args: {},
};
