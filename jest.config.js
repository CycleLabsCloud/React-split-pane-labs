// jest.config.js
module.exports = {
    preset: 'ts-jest',
    rootDir: '.',
    testEnvironment: 'jsdom',
    testMatch: [
        '<rootDir>/src/**/*.test.{ts,tsx}',
    ],
};