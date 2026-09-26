export type HealthService = {
  check: () => { status: "ok" };
};

export const healthService: HealthService = {
  check: () => ({ status: "ok" }),
};
