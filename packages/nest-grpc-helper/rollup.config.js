import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

const external = [
  "os",
  "util",
  "aliyun-sdk",
  "winston-daily-rotate-file",
  "winston-transport",
  "winston",
  "triple-beam",
];

export default [
  {
    input: "src/index.ts",
    output: [
      {
        dir: "output/cjs",
        format: "cjs",
      },
    ],
    plugins: [
      typescript({
        outDir: "output/cjs",
        declaration: false,
      }),
      nodeResolve({
        modulesOnly: true,
        exportConditions: ["node"],
      }),
      commonjs(),
    ],
    external,
  },
  {
    input: "src/index.ts",
    output: [
      {
        dir: "output/esm",
        format: "esm",
      },
    ],
    plugins: [
      typescript({
        outDir: "output/esm",
        declaration: false,
      }),
    ],
    external: external.concat(["chalk"]),
  },
  {
    input: "src/index.ts",
    output: [
      {
        file: "output/index.d.ts",
        format: "esm",
      },
    ],
    plugins: [dts()],
    external: ["async_hooks"],
  },
];
