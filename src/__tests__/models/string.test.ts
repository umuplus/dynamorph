import { StringType } from '../../models/types/string.type'

test('basic string attribute', () => {
    const str = new StringType('prop')
    str.setValue('test')
    expect(str.propertyName).toEqual('prop')
    expect(str instanceof StringType).toEqual(true)
    expect(str.getValue()).toEqual('test')
})

test('advanced string attribute', () => {
    const str = new StringType('prop', { min: 3, max: 5, required: true })
    str.setValue('test')
    expect(str.getValue()).toEqual('test')
})

test('advanced string attribute with fixed length', () => {
    const str = new StringType('prop', { length: 4, required: true })
    str.setValue('test')
    expect(str.getValue()).toEqual('test')
})

test('cuid attribute', () => {
    const str = new StringType('prop', { type: 'cuid' })
    const value = 'cjld2cjxh0000qzrmn831i7rn'
    str.setValue(value)
    expect(str.getValue()).toEqual(value)
})

test('uuid attribute', () => {
    const str = new StringType('prop', { type: 'uuid' })
    const value = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
    str.setValue(value)
    expect(str.getValue()).toEqual(value)
})

test('email attribute', () => {
    const str = new StringType('prop', { type: 'email' })
    const value = 'john@doe.com'
    str.setValue(value)
    expect(str.getValue()).toEqual(value)
})

test('url attribute', () => {
    const str = new StringType('prop', { type: 'url' })
    const value = 'https://john.doe.com'
    str.setValue(value)
    expect(str.getValue()).toEqual(value)
})

test('advanced string attribute with regex', () => {
    const str = new StringType('prop', { regex: /[a-z]/g })
    const value = 'abc'
    str.setValue(value)
    expect(str.getValue()).toEqual(value)
})

test('advanced string attribute with transform', () => {
    const str = new StringType('prop', { transform: (value?: string) => value?.toUpperCase() || '' })
    str.setValue('test')
    expect(str.getValue()).toEqual('TEST')
})

test('advanced string attribute with format', () => {
    const str = new StringType('prop', { format: '{param1}#{param2}' })
    str.setValue({ param1: 'abc', param2: 'def' })
    expect(str.getValue()).toEqual('abc#def')
})
