// Storybook story for the learner header. Breakpoints are viewport-driven:
// resize the Storybook preview to 360 / 768 / 1280 to review each layout.
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import Header from "#/features/layout/components/Header.tsx";
import { StoryShell } from "./story-shell.tsx";

const meta = {
  title: "Layout/Header",
  component: Header,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  render: () => (
    <StoryShell>
      <Header />
      <main className="p-4 text-sm text-muted-foreground">
        Resize the preview to 360, 768 or 1280 to check each breakpoint.
      </main>
    </StoryShell>
  ),
};
