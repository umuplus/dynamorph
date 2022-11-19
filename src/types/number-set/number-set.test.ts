import NumberSetType from '.'
import test from 'ava'
import { ComplexAttributeType } from '../../utils/types'
import { Exception } from '../../utils/errors'
import { silent } from '../../utils/helpers'

test.before(() => silent(true))

test('a simple required number set attribute', (t) => {
    const attribute = new NumberSetType({ fieldName: 'items', min: 1, max: 10, size: 3, required: true })
    attribute.value = new Set([1, 2, 3])
    t.is(attribute.error, undefined)
    t.is(attribute.fieldName, 'items')
    t.deepEqual(attribute.value, new Set([1, 2, 3]))
    t.deepEqual(attribute.plain, [1, 2, 3])
    t.is(attribute.changed, true)
    t.is(!!attribute.ignore, false)
    t.is(attribute.type, ComplexAttributeType.NUMBER_SET)
})

test('a simple number set attribute', (t) => {
    const attribute = new NumberSetType({ min: 1, max: 10, size: 3 })
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(attribute.value, undefined)
    t.is(attribute.changed, false)
})

test('a simple number set attribute with default', (t) => {
    const attribute = new NumberSetType({ default: () => new Set([1, 2, 3]) })
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(JSON.stringify(attribute.plain), '[1,2,3]')
    t.is(attribute.changed, true)
})

test('input converted to number set via transform', (t) => {
    const attribute = new NumberSetType({ transform: (v) => new Set(Array.from(v!).map((k) => k * 2)) })
    attribute.value = new Set([1, 2, 3])
    t.is(attribute.error, undefined)
    t.deepEqual(attribute.plain, [2, 4, 6])
    t.is(attribute.changed, true)
})

test('custom validator fails for a number set attribute', (t) => {
    const attribute = new NumberSetType({ validate: (v) => ((v?.size || 0) % 2 ? 'number of items in the value must be even' : undefined) })
    attribute.value = new Set([1, 2, 3])
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            message: 'number of items in the value must be even',
            path: 'value',
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign object to a number set attribute', (t) => {
    const attribute = new NumberSetType({})
    attribute.value = JSON.parse('{"a":1}')
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'Set<number>',
            message: '"value" is expected to be "Set<number>" but received "object"',
            path: 'value',
            received: 'object',
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign above of allowed range value to number set attribute', (t) => {
    const attribute = new NumberSetType({ max: 2 })
    attribute.value = new Set([1, 2, 3, 4])
    t.deepEqual(attribute.error?.issues, [
        {
            expected: '<=2',
            message: '"size" is expected to be "<=2" but received "4"',
            path: 'size',
            received: 4,
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign below of allowed range value to number set attribute', (t) => {
    const attribute = new NumberSetType({ min: 3 })
    attribute.value = new Set([1])
    t.deepEqual(attribute.error?.issues, [
        {
            expected: '3<=',
            message: '"size" is expected to be "3<=" but received "1"',
            path: 'size',
            received: 1,
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign undefined to required number set attribute', (t) => {
    const attribute = new NumberSetType({ required: true })
    attribute.value = undefined
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'Set<number>',
            message: '"value" is expected to be "Set<number>" but received "undefined"',
            path: 'value',
            received: 'undefined',
        },
    ])
    t.is(attribute.changed, false)
})
