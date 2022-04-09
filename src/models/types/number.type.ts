import { Attribute, BaseClass } from './'
import { z } from 'zod'

export const NumberAttribute = Attribute.extend({
    min: z.number().min(1).optional(),
    max: z.number().min(1).optional(),
    transform: z.function().args(z.number().optional()).returns(z.number()).optional(),
})
export type NumberAttribute = z.infer<typeof NumberAttribute>

export class NumberType extends BaseClass {
    protected readonly _propertyName: string
    protected readonly _schema: NumberAttribute
    protected _value: number = NaN
    protected _changed: boolean = false

    constructor(propertyName: string, schema?: NumberAttribute, profileName?: string) {
        super(profileName)

        this._propertyName = propertyName
        this._schema = NumberAttribute.parse(schema || {})

        Object.setPrototypeOf(this, NumberType.prototype)
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

    setValue(value: number, ignoreChanged?: boolean): boolean {
        const validation = this.validate(value)
        if (validation) {
            this._value = this._schema.transform ? this._schema.transform(value) : value
            this._changed = !ignoreChanged
        }
        return !this.hasErrors()
    }

    getValue() {
        return typeof this._value === 'number' ? this._value : NaN
    }

    getZodModel() {
        let model = z.number()
        if (this._schema.min) model = model.min(this._schema.min)
        if (this._schema.max) model = model.max(this._schema.max)
        return model
    }

    validate(value: number): boolean {
        const model = this.getZodModel()
        if (this._schema.required) this._wrapError(model.safeParse(value))
        else this._wrapError(model.optional().safeParse(value))
        return !this.hasErrors()
    }
}
