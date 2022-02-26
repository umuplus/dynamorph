import { config, Options } from '../../utils/configuration'
import { z, ZodError } from 'zod'

export const Attribute = z.object({
    // * if you set field name, it will go to database instead of the property name
    fieldName: z.string().min(1).optional(),
    partitionKey: z.boolean().optional(),
    sortKey: z.boolean().optional(),
    ignore: z.boolean().optional(),
    required: z.boolean().optional(),
})
export type Attribute = z.infer<typeof Attribute>

export class BaseClass {
    protected readonly options: Options
    protected validationErrors: Array<ZodError | Error> = []

    constructor(profileName?: string) {
        this.options = config.profile(profileName)!
    }

    protected _wrapError(validation: { success: boolean; error?: ZodError | Error }) {
        if (!validation.success) {
            this.validationErrors.push(validation.error!)
            if (!this.options.safe) throw this.validationErrors
        }
    }

    hasErrors() {
        return !!this.validationErrors.length
    }

    getErrors() {
        return this.validationErrors
    }
}
