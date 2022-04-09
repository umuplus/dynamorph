import { BooleanType } from './types/boolean.type'
import { NumberType } from './types/number.type'
import { SoftDeleteType } from './types/soft-delete.type'
import { StringType } from './types/string.type'
import { TimestampType } from './types/timestamp.type'
import { UpdateTokenType } from './types/update-token.type'
import { z } from 'zod'

export const AllTypesTogether = z.union([
    z.instanceof(BooleanType),
    z.instanceof(NumberType),
    z.instanceof(StringType),
    z.instanceof(SoftDeleteType),
    z.instanceof(TimestampType),
    z.instanceof(UpdateTokenType),
])
export type AllTypesTogether = z.infer<typeof AllTypesTogether>

export const Schema = AllTypesTogether.array().min(1)
export type Schema = z.infer<typeof Schema>

export const ModelConfiguration = z.object({
    tableName: z.string().min(1),
    schema: Schema.refine(
        (schema) => {
            const properties = new Set(schema.map((type) => type.schema.fieldName || type.propertyName))
            return schema.length === properties.size
        },
        {
            message: 'You cannot redefine attributes.',
        },
    ).refine(
        (schema) => {
            const partitionKeys = schema.filter((type) => type.schema.partitionKey)
            const sortKeys = schema.filter((type) => type.schema.sortKey)
            return partitionKeys.length === 1 && (!sortKeys.length || sortKeys.length === 1)
        },
        {
            message: 'You can have only one partition key and one optional sort key.',
        },
    ),
})
export type ModelConfiguration = z.infer<typeof ModelConfiguration>
