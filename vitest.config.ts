import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		exclude: ["node_modules", "e2e"],
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov"],
			include: ["lib/**", "app/**", "proxy.ts"],
			exclude: ["**/*.test.ts", "**/*.test.tsx"],
		},
	},
	resolve: {
		alias: {
			"@": import.meta.dirname,
		},
	},
});
