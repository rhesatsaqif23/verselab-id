// Server entry: SSR handler for the TanStack Start server.
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

const fetch = createStartHandler(defaultStreamHandler);

export default {
  fetch,
};
