import BooleanType from '.'
import test from 'ava'
import { CustomAttributeType } from '../../utils/types'
import { Exception } from '../../utils/errors'
import { silent } from '../../utils/helpers'

test.before(() => silent(true))

test('a simple required boolean attribute', (t) => {
    const attribute = new BooleanType({ fieldName: 'isDeleted', required: true })
    attribute.value = true
    t.is(attribute.error, undefined)
    t.is(attribute.value, true)
    t.is(attribute.changed, true)
    t.is(attribute.fieldName, 'isDeleted')
    t.is(attribute.type, CustomAttributeType.SOFT_DELETE)
})

test('cannot assign an object to a simple boolean attribute', (t) => {
    const attribute = new BooleanType({})
    attribute.value = JSON.parse('{"a":1}')
    t.is(attribute.error instanceof Exception, true)
    t.deepEqual(attribute.error?.issues, [
        {
            expected: 'boolean',
            message: '"value" is expected to be "boolean" but received "object"',
            path: 'value',
            received: 'object',
        },
    ])
    t.is(!!attribute.value, false)
})
