import NumberType from '.'
import test from 'ava'
import { silent } from '../../utils/helpers'
import { Exception } from '../../utils/errors'

test.before(() => silent(true))

test('a simple required number attribute', (t) => {
    const attribute = new NumberType({ gte: 1, lte: 10, required: true })
    attribute.value = 5
    t.is(attribute.error, undefined)
    t.is(attribute.value, 5)
    t.is(attribute.changed, true)
})

test('input converted to number via transform', (t) => {
    // TODO? transform first, then validate maybe?
    const attribute = new NumberType({ gte: 0, lte: 1, transform: () => Math.random() })
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(attribute.value === undefined, false)
    t.is(attribute.changed, true)
})

test('a simple number attribute', (t) => {
    const attribute = new NumberType({ gte: 1, lte: 10 })
    attribute.value = undefined
    t.is(attribute.error, undefined)
    t.is(attribute.value, undefined)
    t.is(attribute.changed, false)
})

test('cannot assign out of range value to number attribute', (t) => {
    const attribute = new NumberType({ gte: 1, lte: 10 })
    attribute.value = 15
    t.deepEqual(attribute.error?.issues, [
        {
            expected: '<=10',
            message: '"value" is expected to be "<=10" but received "15"',
            path: 'value',
            received: 15,
        },
    ])
    t.is(!!attribute.value, false)
})

test('cannot assign undefined to required number attribute', (t) => {
    const attribute = new NumberType({ gte: 1, lte: 10, required: true })
    attribute.value = undefined
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'number',
            message: '"value" is expected to be "number" but received "undefined"',
            path: 'value',
            received: 'undefined',
        },
    ])
    t.is(attribute.changed, false)
})
