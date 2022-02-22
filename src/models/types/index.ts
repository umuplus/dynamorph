import { SoftDeleteType } from './soft-delete.type'
import { StringType } from './string.type'
import { TimestampType } from './timestamp.type'
import { UpdateTokenType } from './update-token.type'
import { z } from 'zod'

export const Schema = z
    .record(z.union([z.instanceof(StringType), z.instanceof(UpdateTokenType), z.instanceof(SoftDeleteType), z.instanceof(TimestampType)]))
    .refine(
        (schema) => {
            // TODO! move this to schemas below
            const partitionKeys = Object.keys(schema).filter((key) => schema[key].schema.partitionKey)
            return partitionKeys.length === 1
        },
        {
            message: 'You must have one partition key.',
        },
    )
export type Schema = z.infer<typeof Schema>

export const ModelConfiguration = z.object({
    modelName: z.string().min(1),
    tableName: z.string().min(1),
    schema: Schema,
})
export type ModelConfiguration = z.infer<typeof ModelConfiguration>
