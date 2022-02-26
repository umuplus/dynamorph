import { config, Options } from '../../utils/configuration'
import { z, ZodError } from 'zod'

export const Attribute = z.object({
    // * if you set field name, its value will go to database instead of the actual property name
    fieldName: z.string().min(1).optional(),
    partitionKey: z.boolean().optional(),
    sortKey: z.boolean().optional(),
    ignore: z.boolean().optional(),
    required: z.boolean().optional(),
})
export type Attribute = z.infer<typeof Attribute>

export class BaseClass {
    protected readonly _options: Options
    protected _validationErrors: Array<ZodError | Error> = []

    constructor(profileName?: string) {
        this._options = config.profile(profileName)!
    }

    protected _wrapError(validation: { success: boolean; error?: ZodError | Error }) {
        if (!validation.success) {
            this._validationErrors.push(validation.error!)
            if (!this._options.safe) throw this._validationErrors
        }
    }

    hasErrors() {
        return !!this._validationErrors.length
    }

    getErrors() {
        return this._validationErrors
    }
}
