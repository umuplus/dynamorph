import { Attribute, BaseClass } from './'
import { z } from 'zod'

export class BooleanType extends BaseClass {
    protected readonly _propertyName: string
    protected readonly _schema: Attribute
    protected _value: boolean = false
    protected _changed: boolean = false

    constructor(propertyName: string, schema?: Attribute, profileName?: string) {
        super(profileName)

        this._propertyName = propertyName
        this._schema = Attribute.parse(schema || {})

        Object.setPrototypeOf(this, BooleanType.prototype)
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

    setValue(value: boolean, ignoreChanged?: boolean): boolean {
        const validation = this.validate(value)
        if (validation) {
            this._value = !!value
            this._changed = !ignoreChanged
        }
        return !this.hasErrors()
    }

    getValue() {
        return !!this._value
    }

    getZodModel() {
        return z.boolean()
    }

    validate(value: boolean): boolean {
        const model = this.getZodModel()
        if (this._schema.required) this._wrapError(model.safeParse(value))
        else this._wrapError(model.optional().safeParse(value))
        return !this.hasErrors()
    }
}
