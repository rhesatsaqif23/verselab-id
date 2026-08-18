// Storybook story for the Label shadcn/ui component.
import type { Meta, StoryObj } from '@storybook/tanstack-react'
import { Label } from '#/components/ui/label'

const meta = {
  title: 'UI/Label',
  component: Label,
  tags: ['autodocs'],
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Label>Email</Label>,
}

export const WithDescription: Story = {
  render: () => (
    <div className="space-y-1">
      <Label>Username</Label>
      <p className="text-sm text-muted-foreground">This is your public display name.</p>
    </div>
  ),
}
