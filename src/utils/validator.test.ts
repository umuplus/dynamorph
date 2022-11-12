import test from 'ava'
import { isEmail, isUlid, isUrl } from './validator'
import { ulid } from 'ulid'

test('isEmail', (t) => {
    t.is(isEmail('info@example.com'), true)
    t.is(isEmail('test'), false)
})

test('isUlid', (t) => {
    t.is(isUlid(Math.random()), false)
    t.is(isUlid(Math.random().toString()), false)
    t.is(isUlid(ulid()), true)
})

test('isUrl', (t) => {
    t.is(isUrl('https://example.com'), true)
    t.is(isUrl('https://example.com/some-path'), true)
    t.is(isUrl('example.com/some-path'), true)
    t.is(isUrl('example-com/some-path'), false)
    t.is(isUrl('{example.com}_[some-path]'), false)
})
