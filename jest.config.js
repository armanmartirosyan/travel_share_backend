import { createDefaultPreset } from "ts-jest";

/** @type {import("jest").Config} */
export default {
  ...createDefaultPreset(),
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  modulePaths: ["<rootDir>/src"],
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
  coveragePathIgnorePatterns: [
    "<rootDir>/src/index.ts",
    "<rootDir>/src/common/.*.ts",
    "<rootDir>/src/config/.*.ts",
  ],
  coverageDirectory: "./tests/coverage_reports",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  transform: {
    "^.+\\.(t|j)s$": "@swc/jest",
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1", // strip .js for TS resolution
  },
};
