import { config, Options } from '../../utils/configuration'
import { z, ZodError } from 'zod'

export const Attribute = z.object({
    fieldName: z.string().min(1).optional(),
    partitionKey: z.boolean().optional(),
    sortKey: z.boolean().optional(),
    ignore: z.boolean().optional(),
    required: z.boolean().optional(),
})
export type Attribute = z.infer<typeof Attribute>

export class BaseClass {
    protected readonly _options: Options
    protected _validationErrors: Array<ZodError> = []

    constructor(profileName?: string) {
        this._options = config.profile(profileName)!
    }

    protected _wrapError(validation: { success: boolean; error?: ZodError }): boolean {
        if (!validation.success) {
            this._validationErrors.push(validation.error!)
            if (!this._options.safe) throw this._validationErrors
        }
        return validation.success
    }

    hasErrors() {
        return !!this._validationErrors.length
    }

    getErrors() {
        return this._validationErrors
    }
}
