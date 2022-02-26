import { SoftDeleteType } from './soft-delete.type'
import { StringType } from './string.type'
import { TimestampType } from './timestamp.type'
import { UpdateTokenType } from './update-token.type'
import { z } from 'zod'

const AllTypesTogether = z.union([
    z.instanceof(StringType),
    z.instanceof(SoftDeleteType),
    z.instanceof(TimestampType),
    z.instanceof(UpdateTokenType),
])
export const Schema = z.record(AllTypesTogether)

export type Schema = z.infer<typeof Schema>

export const ModelConfiguration = z.object({
    modelName: z.string().min(1),
    tableName: z.string().min(1),
    schema: Schema.refine(
        (schema) => {
            // TODO! move this to schemas below
            const partitionKeys = Object.keys(schema).filter((key) => schema[key].schema.partitionKey)
            return partitionKeys.length === 1
        },
        {
            message: 'You must have one partition key.',
        },
    ),
})
export type ModelConfiguration = z.infer<typeof ModelConfiguration>
