import { BooleanType } from '../../models/types/boolean.type'

test('basic boolean attribute', () => {
    const num = new BooleanType('prop')
    num.setValue(true)
    expect(num.propertyName).toEqual('prop')
    expect(num instanceof BooleanType).toEqual(true)
    expect(num.getValue()).toEqual(true)
})
