// Storybook story for the mobile tab bar. It is hidden at md and up, so the
// preview must be narrower than 768 for the bar to appear.
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import BottomNav from "#/features/layout/components/BottomNav.tsx";
import { StoryShell } from "./story-shell.tsx";

const meta = {
  title: "Layout/BottomNav",
  component: BottomNav,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  render: () => (
    <StoryShell>
      <main className="p-4 text-sm text-muted-foreground">
        The bar is fixed to the bottom and stays below md. Resize the preview to 360 to review it.
      </main>
      <BottomNav />
    </StoryShell>
  ),
};
