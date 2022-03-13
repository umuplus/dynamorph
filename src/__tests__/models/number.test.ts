import { NumberType } from '../../models/types/number.type'

test('basic number attribute', () => {
    const num = new NumberType('prop')
    num.setValue(7)
    expect(num.propertyName).toEqual('prop')
    expect(num instanceof NumberType).toEqual(true)
    expect(num.getValue()).toEqual(7)
})

test('advanced number attribute', () => {
    const num = new NumberType('prop', { min: 3, max: 5, required: true })
    num.setValue(4)
    expect(num.getValue()).toEqual(4)
})

test('advanced number attribute with transform', () => {
    const num = new NumberType('prop', { transform: (value?: number) => (value || 0) * 2 })
    num.setValue(4)
    expect(num.getValue()).toEqual(8)
})
