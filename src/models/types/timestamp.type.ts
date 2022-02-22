import { Attribute, BaseClass } from './_'
import { z } from 'zod'

export const Timestamp = z.enum(['ISO_STRING', 'MILLISECONDS', 'SECONDS'])
export type Timestamp = z.infer<typeof Timestamp>

export const TimestampOn = z.enum(['CREATE', 'UPDATE', 'DELETE'])
export type TimestampOn = z.infer<typeof TimestampOn>

export const TimestampAttribute = Attribute.extend({
    on: TimestampOn,
    type: Timestamp.default(Timestamp.Enum.ISO_STRING),
})
export type TimestampAttribute = z.infer<typeof TimestampAttribute>

export class TimestampType extends BaseClass {
    private readonly _schema: TimestampAttribute
    private _value: Date = new Date()

    constructor(schema: TimestampAttribute, profileName?: string) {
        super(profileName)

        this._schema = TimestampAttribute.parse(schema)

        Object.setPrototypeOf(this, TimestampType.prototype)
    }

    get schema() {
        return this._schema
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

    setValue(value: Date | string | number): boolean {
        if (value instanceof Date) this._value = new Date()
        else if (typeof value === 'string') {
            if (this.schema.type === Timestamp.Values.ISO_STRING) this._value = new Date(value)
            else throw new Error('value must be a string')
        } else {
            switch (this._schema.type) {
                case Timestamp.Values.MILLISECONDS: {
                    this._value = new Date(value)
                    break
                }
                case Timestamp.Values.SECONDS: {
                    this._value = new Date(value * 1000)
                    break
                }
                default: throw new Error('value must be a timestamp in seconds or milliseconds')
            }
        }
        return true
    }
}
