import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
}

export const WithFallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
}

export const Small: Story = {
  render: () => (
    <Avatar className="h-8 w-8">
      <AvatarFallback className="text-xs">AB</AvatarFallback>
    </Avatar>
  ),
}

export const Large: Story = {
  render: () => (
    <Avatar className="h-16 w-16">
      <AvatarFallback className="text-lg">XL</AvatarFallback>
    </Avatar>
  ),
}
