import { applyFormat, findRelatedAttributes } from '../../utils'
import { Configuration } from '../../utils/configuration'

const config = new Configuration()

test('find related attributes', () => {
    expect(findRelatedAttributes('{a}#{b}#{c}')).toEqual(['a', 'b', 'c'])
})

test('apply format', () => {
    expect(applyFormat('{a}#{b}#{c}', {a: 1, b: 2, c: 3})).toEqual('1#2#3')
})

test('default configuration', () => {
    const profile = config.profile()
    expect(profile?.safe).toEqual(true)
    expect(profile?.delimiter).toEqual('#')
})

test('custom configuration', () => {
    config.update({ delimiter: '|', safe: false }, 'test')
    const profile = config.profile('test')
    expect(profile?.safe).toEqual(false)
    expect(profile?.delimiter).toEqual('|')
})
