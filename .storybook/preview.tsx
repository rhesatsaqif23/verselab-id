import type { Preview } from "@storybook/tanstack-react";
import "../src/styles.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
    layout: "centered",
  },
  decorators: [
    (Story) => {
      return (
        <div className="p-6">
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
