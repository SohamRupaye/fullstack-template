import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  dts: true,
  noExternal: [/(.*)/], // Bundle all modules including node_modules
  clean: true,
});
