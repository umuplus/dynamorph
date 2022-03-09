import { Attribute, BaseClass } from './'
import { z } from 'zod'
import { generateRandomString } from '../../utils'

export const UpdateTokenAttribute = Attribute.extend({
    length: z.number().min(2).max(40).optional(),
})
export type UpdateTokenAttribute = z.infer<typeof UpdateTokenAttribute>

export class UpdateTokenType extends BaseClass {
    protected readonly _schema: UpdateTokenAttribute
    protected _value: string | undefined = undefined

    constructor(schema?: UpdateTokenAttribute, profileName?: string) {
        super(profileName)

        this._schema = UpdateTokenAttribute.parse(schema || {})

        Object.setPrototypeOf(this, UpdateTokenType.prototype)
    }

    get schema() {
        return this._schema
    }

    getValue() {
        return this._value
    }

    setValue(): boolean {
        this._value = generateRandomString(this._schema.length)
        return true
    }
}
