import { UpdateTokenType } from '../../models/types/update-token.type'

test('basic update token attribute', () => {
    const token = new UpdateTokenType('prop')
    token.setValue()
    expect(token.propertyName).toEqual('prop')
    expect(token instanceof UpdateTokenType).toEqual(true)
    expect(token.getValue()?.length).toEqual(6)
})

test('update token attribute with custom length', () => {
    const token = new UpdateTokenType('prop', { length: 10 })
    token.setValue()
    expect(token.getValue()?.length).toEqual(10)
})
