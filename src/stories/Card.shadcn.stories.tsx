// Storybook story for the Card shadcn/ui component.
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This is the card content area. You can put anything here.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Subscribe</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Project Alpha</CardTitle>
          <Badge>Active</Badge>
        </div>
        <CardDescription>Started 2 days ago</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Interactive course on project management fundamentals.
        </p>
      </CardContent>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent className="pt-6">
        <p className="text-sm font-medium">A simple card with just content.</p>
      </CardContent>
    </Card>
  ),
};
