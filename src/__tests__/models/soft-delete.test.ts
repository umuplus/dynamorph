import { SoftDeleteType } from '../../models/types/soft-delete.type'

test('basic soft delete attribute', () => {
    const isDeleted = new SoftDeleteType('prop')
    isDeleted.setValue()
    expect(isDeleted.propertyName).toEqual('prop')
    expect(isDeleted instanceof SoftDeleteType).toEqual(true)
    expect(isDeleted.getValue()).toEqual(false)
})

test('soft delete attribute with opposite value', () => {
    const isDeleted = new SoftDeleteType('prop')
    isDeleted.setValue(true)
    expect(isDeleted.getValue()).toEqual(true)
})
