import test from 'ava'
import { silent } from './utils/helpers'
import { table } from './'

test.before(() => silent(true))

test.serial('there is no table yet', (t) => {
    const tableDefinition = table()
    t.is(tableDefinition, undefined)
})

test.serial('define a default table', (t) => {
    const def = { name: 'MyTable', partitionKey: 'part', sortKey: 'sort' }
    const tableDefinition = table(def)
    t.is(tableDefinition?.name, def.name)
    t.is(tableDefinition?.partitionKey, def.partitionKey)
    t.is(tableDefinition?.sortKey, def.sortKey)
})

test.serial('fetch definition of default table', (t) => {
    const tableDefinition = table()
    t.is(tableDefinition?.name, 'MyTable')
    t.is(tableDefinition?.partitionKey, 'part')
    t.is(tableDefinition?.sortKey, 'sort')
})

test.serial('define a named table', (t) => {
    const def = { name: 'MySecondTable', partitionKey: 'id' }
    const tableDefinition = table('secondTable', def)
    t.is(tableDefinition?.name, def.name)
    t.is(tableDefinition?.partitionKey, def.partitionKey)
    t.is(tableDefinition?.sortKey, undefined)
})

test.serial('fetch definition of named table', (t) => {
    const tableDefinition = table('secondTable')
    t.is(tableDefinition?.name, 'MySecondTable')
    t.is(tableDefinition?.partitionKey, 'id')
    t.is(tableDefinition?.sortKey, undefined)
})
