import { Attribute, BaseClass } from './'
import { z } from 'zod'
import { generateRandomString } from '../../utils'

export const UpdateTokenAttribute = Attribute.extend({
    length: z.number().min(2).max(40).optional(),
})
export type UpdateTokenAttribute = z.infer<typeof UpdateTokenAttribute>

export class UpdateTokenType extends BaseClass {
    protected readonly _propertyName: string
    protected readonly _schema: UpdateTokenAttribute
    protected _value: string | undefined = undefined
    protected _changed: boolean = false

    constructor(propertyName: string, schema?: UpdateTokenAttribute, profileName?: string) {
        super(profileName)

        this._propertyName = propertyName
        this._schema = UpdateTokenAttribute.parse(schema || {})

        Object.setPrototypeOf(this, UpdateTokenType.prototype)
    }

    get isChanged() {
        return this._changed
    }

    set changed(val: boolean) {
        this._changed = !!val
    }

    get schema() {
        return this._schema
    }

    get propertyName() {
        return this._propertyName
    }

    getValue() {
        return this._value
    }

    setValue(token?: string, ignoreChanged?: boolean): boolean {
        this._value = token || generateRandomString(this._schema.length)
        this._changed = !ignoreChanged
        return true
    }
}
