import { applyFormat, findRelatedAttributes } from '../../utils'

test('find related attributes', () => {
    expect(findRelatedAttributes('{a}#{b}#{c}')).toEqual(['a', 'b', 'c'])
})

test('apply format', () => {
    expect(applyFormat('{a}#{b}#{c}', {a: 1, b: 2, c: 3})).toEqual('1#2#3')
})
