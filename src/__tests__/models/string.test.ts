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

test('advanced string attribute with regex', () => {
    const str = new StringType({ transform: (value?: string) => value?.toUpperCase() || '' })
    str.setValue('test')
    expect(str.getValue()).toEqual('TEST')
})
