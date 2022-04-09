import { Attribute, BaseClass } from './'
import { z, ZodError } from 'zod'

export const Timestamp = z.enum(['ISO_STRING', 'MILLISECONDS', 'SECONDS'])
export type Timestamp = z.infer<typeof Timestamp>

export const TimestampOn = z.enum(['CREATE', 'UPDATE', 'DELETE'])
export type TimestampOn = z.infer<typeof TimestampOn>

export const TimestampAttribute = Attribute.extend({
    on: TimestampOn,
    type: Timestamp,
})
export type TimestampAttribute = z.infer<typeof TimestampAttribute>

export class TimestampType extends BaseClass {
    protected readonly _propertyName: string
    protected readonly _schema: TimestampAttribute
    protected _value: Date = new Date()
    protected _changed: boolean = false

    constructor(propertyName: string, schema: TimestampAttribute, profileName?: string) {
        super(profileName)

        this._propertyName = propertyName
        this._schema = TimestampAttribute.parse(schema)

        Object.setPrototypeOf(this, TimestampType.prototype)
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
        switch (this._schema.type) {
            case Timestamp.Values.MILLISECONDS: {
                return this._value.getTime()
            }
            case Timestamp.Values.SECONDS: {
                return Math.floor(this._value.getTime() / 1000)
            }
            case Timestamp.Values.ISO_STRING:
            default: {
                return this._value.toISOString()
            }
        }
    }

    setValue(value: Date | string | number = new Date(), ignoreChanged?: boolean): boolean {
        if (value instanceof Date) {
            this._value = value
            this._changed = !ignoreChanged
        } else if (typeof value === 'string') {
            if (this.schema.type !== Timestamp.Values.ISO_STRING)
                return this._wrapError({
                    success: false,
                    error: new ZodError([
                        {
                            code: 'invalid_enum_value',
                            options: [Timestamp.Values.ISO_STRING],
                            path: ['schema', 'type'],
                            message: 'Timestamp type must be an ISO_STRING to save a string.',
                        },
                    ]),
                })

            this._value = new Date(value)
            this._changed = !ignoreChanged
        } else if (typeof value === 'number') {
            switch (this._schema.type) {
                case Timestamp.Values.MILLISECONDS: {
                    this._value = new Date(value)
                    this._changed = !ignoreChanged
                    break
                }
                case Timestamp.Values.SECONDS: {
                    this._value = new Date(value * 1000)
                    this._changed = !ignoreChanged
                    break
                }
                default:
                    return this._wrapError({
                        success: false,
                        error: new ZodError([
                            {
                                code: 'invalid_enum_value',
                                options: [Timestamp.Values.MILLISECONDS, Timestamp.Values.SECONDS],
                                path: ['schema', 'type'],
                                message: 'Timestamp type must be MILLISECONDS or SECONDS to save a number.',
                            },
                        ]),
                    })
            }
        } else
            return this._wrapError({
                success: false,
                error: new ZodError([
                    {
                        code: 'custom',
                        path: [],
                        message: 'Invalid value type.',
                    },
                ]),
            })
        if (isNaN(this._value.getTime()))
            return this._wrapError({
                success: false,
                error: new ZodError([
                    {
                        code: 'custom',
                        path: [],
                        message: 'Invalid date.',
                    },
                ]),
            })
        return true
    }
}
