import test from 'ava'
import { applyFormat, findCompositeAttributes } from './format'

test('composite attributes', (t) => {
    t.deepEqual(findCompositeAttributes('{param1}#{param2}#ConstantPart#{param3}'), ['param1', 'param2', 'param3'])
    t.deepEqual(findCompositeAttributes('ConstantPart#AnotherConstantPart'), [])
})

test('apply format', (t) => {
    const value = '{a}#{b}#ConstantPart#{c}'
    t.deepEqual(applyFormat(value, { x: 'A', y: 'B', z: 'C' }), value)
    t.deepEqual(applyFormat(value, { a: 'A', b: 'B', c: 'C' }), 'A#B#ConstantPart#C')
})
