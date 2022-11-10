module.exports = {
    files: ['**/**/*.test.ts'],
    extensions: ['ts'],
    require: ['ts-node/register'],
    environmentVariables: {
        AVA: 'true',
    },
}
