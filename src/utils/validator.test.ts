import test from 'ava'
import { isUlid } from './validator'
import { ulid } from 'ulid'

test('isUlid', (t) => {
    t.is(isUlid(Math.random()), false)
    t.is(isUlid(Math.random().toString()), false)
    t.is(isUlid(ulid()), true)
})
