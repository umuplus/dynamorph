import { Attribute, BaseClass } from './_'
import { z } from 'zod'

export const NumberAttribute = Attribute.extend({
    min: z.number().min(1).optional(),
    max: z.number().min(1).optional(),
    transform: z.function().args(z.number().optional()).returns(z.number()).optional(),
})
export type NumberAttribute = z.infer<typeof NumberAttribute>

export class NumberType extends BaseClass {
    private readonly _schema: NumberAttribute
    private _value: number | undefined = undefined

    constructor(schema?: NumberAttribute, profileName?: string) {
        super(profileName)

        this._schema = NumberAttribute.parse(schema || {})

        Object.setPrototypeOf(this, NumberType.prototype)
    }

    get schema() {
        return this._schema
    }

    setValue(value: number): boolean {
        const validation = this.validate(value)
        if (validation) this._value = this._schema.transform ? this._schema.transform(value) : value
        return !this.hasErrors()
    }

    getValue() {
        return this._value
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
