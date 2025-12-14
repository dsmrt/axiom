// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["src/**/*.test.ts"],
		coverage: {
			provider: "v8",
			all: true,
			exclude: ["lib/**/*", "src/__mocks__/**/*"],
			reporter: ["text-summary", "json-summary"],
		},
	},
});
