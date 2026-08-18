// Storybook story for the Textarea shadcn/ui component.
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { Textarea } from '#/components/ui/textarea'
import { Label } from '#/components/ui/label'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Type your message here.',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full gap-2">
      <Label htmlFor="message">Your message</Label>
      <Textarea id="message" placeholder="Type your message here." />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'This textarea is disabled.',
  },
}

export const WithValue: Story = {
  args: {
    defaultValue: 'This textarea has some pre-filled content that you can edit.',
  },
}
