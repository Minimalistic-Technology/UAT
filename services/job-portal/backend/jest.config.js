export default {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1', // Maps imports like './file.js' to './file.ts' properly for ESM
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
            },
        ],
    },
    globalSetup: "<rootDir>/tests/setup.ts",
    globalTeardown: "<rootDir>/tests/teardown.ts",
    setupFilesAfterEnv: ["<rootDir>/tests/setupFiles.ts"],
    clearMocks: true,
};

