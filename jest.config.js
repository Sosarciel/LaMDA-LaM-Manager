



module.exports = {
    roots: ['./jest'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleNameMapper: {
        '^@/src/(.*)$': '<rootDir>/dist/$1',
        '^@/(.*)$': '<rootDir>/$1',
        '^@$': '<rootDir>/dist/index'
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
