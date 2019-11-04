module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    reporters: ['default', 'jest-junit'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};