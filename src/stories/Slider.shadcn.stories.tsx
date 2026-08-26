// Storybook story for the Slider shadcn/ui component.
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { Slider } from "#/components/ui/slider";

const meta = {
  title: "UI/Slider",
  component: Slider,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
  },
  render: (args) => (
    <div className="w-[300px]">
      <Slider {...args} />
    </div>
  ),
};

export const Range: Story = {
  args: {
    defaultValue: [25, 75],
    max: 100,
    step: 1,
  },
  render: (args) => (
    <div className="w-[300px]">
      <Slider {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    defaultValue: [50],
    disabled: true,
  },
  render: (args) => (
    <div className="w-[300px]">
      <Slider {...args} />
    </div>
  ),
};
