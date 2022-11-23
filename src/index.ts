import { DEFAULT_ALIAS } from './utils/helpers'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { Schema, SchemaOptions } from './utils/schemas'
import { Table } from './utils/tables'

interface Storage {
    client?: DynamoDBClient
    schemas: Record<string, SchemaOptions & { name: string; $: Schema }>
    tables: Record<string, Table>
}
const storage: Storage = { schemas: {}, tables: {} }

export function table(): Table | undefined
export function table(alias: string): Table | undefined
export function table(alias: string, definition: Table | undefined): Table | undefined
export function table(definition: Table | undefined): Table | undefined
export function table(first?: string | Table, second?: Table): Table | undefined {
    if (!first && !second) return storage.tables[DEFAULT_ALIAS]
    else if (!second && typeof first === 'string') return storage.tables[first]

    const alias = typeof first === 'string' ? first : DEFAULT_ALIAS
    const definition = typeof first !== 'string' ? first : second
    if (definition) {
        if (!definition.client) {
            if (!storage.client) {
                const dynamodb = new DynamoDBClient({})
                storage.client = DynamoDBDocumentClient.from(dynamodb)
            }
            definition.client = storage.client
        }
        storage.tables[alias] = definition!
    }
    return storage.tables[alias]
}

export function schema(name: string, definition?: Schema, options?: SchemaOptions): any {
    if (definition) storage.schemas[name] = { name, $: definition, ...options }

    // TODO! this should return a class that implements the definition
    return storage.schemas[name]
}
