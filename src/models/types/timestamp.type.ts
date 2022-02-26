import { Attribute, BaseClass } from './_'
import { z } from 'zod'

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
        if (value instanceof Date) this._value = value
        else if (typeof value === 'string') {
            if (this.schema.type !== Timestamp.Values.ISO_STRING) throw new Error('Timestamp type must be an ISO_STRING to save a string.')

            this._value = new Date(value)
        } else if (typeof value === 'number') {
            switch (this._schema.type) {
                case Timestamp.Values.MILLISECONDS: {
                    this._value = new Date(value)
                    break
                }
                case Timestamp.Values.SECONDS: {
                    this._value = new Date(value * 1000)
                    break
                }
                default: throw new Error('Timestamp type must be MILLISECONDS or SECONDS to save a number.')
            }
        } else throw new Error('Invalid value type.')
        if (isNaN(this._value.getTime())) throw new Error('Invalid date')
        return true
    }
}
