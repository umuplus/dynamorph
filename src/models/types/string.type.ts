import { applyFormat, findRelatedAttributes } from '../../utils'
import { Attribute, BaseClass } from './'
import { z, ZodError } from 'zod'

export const StringAttributeType = z.enum(['email', 'uuid', 'cuid', 'url']) // TODO? add more types such as ulid
export type StringAttributeType = z.infer<typeof StringAttributeType>

export const StringAttribute = Attribute.extend({
    type: StringAttributeType.optional(),
    format: z.string().min(3).optional(),
    min: z.number().min(1).optional(),
    max: z.number().min(1).optional(),
    length: z.number().min(1).optional(),
    regex: z.instanceof(RegExp).optional(),
    transform: z.function().args(z.string().optional()).returns(z.string()).optional(),
})
export type StringAttribute = z.infer<typeof StringAttribute>

export class StringType extends BaseClass {
    protected readonly _propertyName: string
    protected readonly _schema: StringAttribute
    protected readonly _relatedAttributes: string[]
    protected _value: string | undefined = undefined
    protected _changed: boolean = false

    constructor(propertyName: string, schema?: StringAttribute, profileName?: string) {
        super(profileName)

        this._propertyName = propertyName
        this._schema = StringAttribute.parse(schema || {})
        this._relatedAttributes = this._schema.format ? findRelatedAttributes(this._schema.format) : []

        Object.setPrototypeOf(this, StringType.prototype)
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

    hasFormat() {
        return !!this._relatedAttributes.length
    }

    setValue(value: string | Record<string, any>, ignoreChanged?: boolean): boolean {
        if (typeof value === 'string') {
            if (!this.hasFormat()) return this._setValue(value, false, ignoreChanged)
            return this._wrapError({
                success: false,
                error: new ZodError([
                    {
                        code: 'custom',
                        path: [this._propertyName],
                        message: 'Format does not match',
                    },
                ]),
            })
        } else if (this.hasFormat()) return this._applyFormat(value)

        return this._wrapError({
            success: false,
            error: new ZodError([
                {
                    code: 'custom',
                    path: [this._propertyName],
                    message: 'You must apply format',
                },
            ]),
        })
    }

    protected _applyFormat(data: Record<string, any>, ignoreChanged?: boolean): boolean {
        if (!this._schema.format) return false

        const value = applyFormat(
            this._schema.format,
            Object.keys(data).reduce((final: Record<string, any>, field: string) => {
                if (this._relatedAttributes.includes(field)) final[field] = data[field]
                return final
            }, {}),
        )
        return this._setValue(value, true, ignoreChanged)
    }

    getValue() {
        if (typeof this._value === 'string') return this._value

        return this._value ? (this._value as any).toString() : undefined
    }

    getZodModel() {
        let model = z.string()
        if (this._schema.type) {
            switch (this._schema.type) {
                case StringAttributeType.Values.email: {
                    model = model.email()
                    break
                }
                case StringAttributeType.Values.url: {
                    model = model.url()
                    break
                }
                case StringAttributeType.Values.cuid: {
                    model = model.cuid()
                    break
                }
                case StringAttributeType.Values.uuid: {
                    model = model.uuid()
                    break
                }
            }
        }
        if (this._schema.min) model = model.min(this._schema.min)
        if (this._schema.max) model = model.max(this._schema.max)
        if (this._schema.length) model = model.length(this._schema.length)
        if (this._schema.regex) model = model.regex(this._schema.regex)
        return model
    }

    validate(value: string): boolean {
        if (this._schema.format) {
            const delimiter = this._options.delimiter
            if (this._schema.format.split(delimiter).length !== value.split(delimiter).length) {
                this._wrapError({
                    success: false,
                    error: new ZodError([
                        {
                            code: 'custom',
                            path: [this._propertyName],
                            message: 'Format does not match',
                        },
                    ]),
                })
                return false
            }
        }

        const model = this.getZodModel()
        if (this._schema.required) this._wrapError(model.safeParse(value))
        else this._wrapError(model.optional().safeParse(value))
        return !this.hasErrors()
    }

    private _setValue(value: string, force?: boolean, ignoreChanged?: boolean): boolean {
        if (!force && this._schema.format) {
            this._wrapError({
                success: false,
                error: new ZodError([
                    {
                        code: 'custom',
                        path: [this._propertyName],
                        message: 'You must apply format',
                    },
                ]),
            })
            return false
        }

        const validation = this.validate(value)
        if (validation) {
            this._value = this._schema.transform ? this._schema.transform(value) : value
            this._changed = !ignoreChanged
        }
        return !this.hasErrors()
    }
}
