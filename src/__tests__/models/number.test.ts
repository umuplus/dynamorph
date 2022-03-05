import { NumberType } from '../../models/types/number.type'

test('basic number attribute', () => {
    const num = new NumberType()
    num.setValue(7)
    expect(num instanceof NumberType).toEqual(true)
    expect(num.getValue()).toEqual(7)
})

test('advanced number attribute', () => {
    const num = new NumberType({ min: 3, max: 5, required: true })
    num.setValue(4)
    expect(num.getValue()).toEqual(4)
})

test('advanced number attribute with transform', () => {
    const num = new NumberType({ transform: (value?: number) => (value || 0) * 2 })
    num.setValue(4)
    expect(num.getValue()).toEqual(8)
})
