import { Attribute, BaseType, CustomAttributeType } from '../../utils/types'
import { Exception } from '../../utils/errors'
import { silent } from '../../utils/helpers'

export enum TimestampMode {
    ISO_STRING = 'iso',
    MILLISECONDS = 'ms',
    SECONDS = 's',
}

export enum TimestampOn {
    CREATE = 'c',
    DELETE = 'd',
    UPDATE = 'u',
}

type TimestampBaseType = Omit<Attribute, 'type'>
type Value = string | number | undefined

export interface TimestampOptions extends TimestampBaseType {
    on: TimestampOn
    mode: TimestampMode
}

export class TimestampType extends BaseType {
    protected _value: Value = undefined

    constructor(options: TimestampOptions) {
        super({ ...options, type: CustomAttributeType.TIMESTAMP })

        this._options.partitionKey = false
        this._options.sortKey = false
        this._options.ignore = false
        this._options.required = true

        if (this._options.on === TimestampOn.CREATE) {
            this.stamp()
            this._changed = true
        }
    }

    protected parse(v: Value): Exception | void {
        const error = new Exception()
        const type = typeof v
        if (this._options.mode === TimestampMode.MILLISECONDS || this._options.mode === TimestampMode.SECONDS) {
            if (type !== 'number') error.addIssue({ path: 'value', expected: 'number', received: type })
        } else if (this._options.mode === TimestampMode.ISO_STRING) {
            if (type !== 'string') error.addIssue({ path: 'value', expected: 'string', received: type })
            else if (isNaN(Date.parse(v as string)))
                error.addIssue({ path: 'value', expected: 'ISO_DATE', received: v })
        }
        if (error.hasIssues()) return error
    }

    set value(v: Value) {
        const error = this.parse(v)
        if (error) {
            if (!silent()) throw error

            if (this.error) this.error.addIssues(error.issues)
            else this._error = error
        } else if (this._value !== v) {
            this._changed = true
            this._value = v
        }
    }

    get value(): Value {
        return this._value
    }

    date(): Date | undefined {
        if (!this._value) return undefined
        else if (this._options.mode === TimestampMode.SECONDS) return new Date((this._value as number)! * 1000)
        else return new Date(this._value)
    }

    stamp() {
        if (this._options.mode === TimestampMode.MILLISECONDS) this.value = Date.now()
        else if (this._options.mode === TimestampMode.SECONDS) this.value = Math.floor(Date.now() / 1000)
        else this.value = new Date().toISOString()
    }
}

export default TimestampType
