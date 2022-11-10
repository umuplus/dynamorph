import test from 'ava'
import { delimiter, silent } from './helpers'

test('delimiter', (t) => {
    t.is(delimiter(), '#')
    t.is(delimiter('-'), '-')
})

test('silent', (t) => {
    t.is(silent(), false)
    t.is(silent(true), true)
})
