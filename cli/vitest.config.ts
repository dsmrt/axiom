// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      all: true,
      exclude: ["lib/**/*", "src/__mocks__/**/*"],
    },
  },
});
