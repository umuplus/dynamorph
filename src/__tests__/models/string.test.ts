import { StringType } from '../../models/types/string.type'

test('basic string attribute', () => {
    const str = new StringType()
    str.setValue('test')
    expect(str instanceof StringType).toEqual(true)
    expect(str.getValue()).toEqual('test')
})

test('advanced string attribute', () => {
    const str = new StringType({ min: 3, max: 5, required: true })
    str.setValue('test')
    expect(str.getValue()).toEqual('test')
})

test('advanced string attribute with fixed length', () => {
    const str = new StringType({ length: 4, required: true })
    str.setValue('test')
    expect(str.getValue()).toEqual('test')
})

test('cuid attribute', () => {
    const str = new StringType({ type: 'cuid' })
    const value = 'cjld2cjxh0000qzrmn831i7rn'
    str.setValue(value)
    expect(str.getValue()).toEqual(value)
})

test('uuid attribute', () => {
    const str = new StringType({ type: 'uuid' })
    const value = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
    str.setValue(value)
    expect(str.getValue()).toEqual(value)
})

test('email attribute', () => {
    const str = new StringType({ type: 'email' })
    const value = 'john@doe.com'
    str.setValue(value)
    expect(str.getValue()).toEqual(value)
})

test('url attribute', () => {
    const str = new StringType({ type: 'url' })
    const value = 'https://john.doe.com'
    str.setValue(value)
    expect(str.getValue()).toEqual(value)
})

test('advanced string attribute with regex', () => {
    const str = new StringType({ regex: /[a-z]/g })
    const value = 'abc'
    str.setValue(value)
    expect(str.getValue()).toEqual(value)
})

test('advanced string attribute with transform', () => {
    const str = new StringType({ transform: (value?: string) => value?.toUpperCase() || '' })
    str.setValue('test')
    expect(str.getValue()).toEqual('TEST')
})

test('advanced string attribute with format', () => {
    const str = new StringType({ format: '{param1}#{param2}' })
    str.setValue({ param1: 'abc', param2: 'def' })
    expect(str.getValue()).toEqual('abc#def')
})
