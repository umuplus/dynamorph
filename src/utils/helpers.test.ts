import test from 'ava'
import { delimiter, generateToken, silent } from './helpers'

test('delimiter', (t) => {
    t.is(delimiter(), '#')
    t.is(delimiter('-'), '-')
})

test('silent', (t) => {
    t.is(silent(), false)
    t.is(silent(true), true)
})

test('generate token', (t) => {
    const token = generateToken(10)
    t.is(token.length, 10)
})
