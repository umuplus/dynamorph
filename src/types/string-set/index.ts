import { Attribute, BaseType, ComplexAttributeType } from '../../utils/types'
import { Exception } from '../../utils/errors'
import { silent } from '../../utils/helpers'

type StringSetBaseType = Omit<Attribute, 'type'>
type Value = Set<string> | undefined

export interface StringSetOptions extends StringSetBaseType {
    min?: number
    max?: number
    size?: number
    validate?: (v: Value) => string | undefined
    transform?: (v: Value) => Value
    default?: () => Set<string>
}

export class StringSetType extends BaseType {
    protected _value: Value = undefined

    constructor(options: StringSetOptions) {
        super({ ...options, type: ComplexAttributeType.STRING_SET })
    }

    protected parse(v: Value): Exception | void {
        const error = new Exception()
        const type = typeof v
        const { min, max, size, validate } = this._options
        if (type === 'undefined') {
            if (this._options.required) error.addIssue({ path: 'value', expected: 'Set<string>', received: type })
        } else if (v instanceof Set) {
            if (min !== undefined && v!.size < min)
                error.addIssue({ path: 'size', expected: `${min}<=`, received: v?.size })
            if (max !== undefined && v!.size > max)
                error.addIssue({ path: 'size', expected: `<=${max}`, received: v?.size })
            if (size !== undefined && v!.size !== size)
                error.addIssue({ path: 'size', expected: size, received: v?.size })

            if (validate) {
                const message = validate(v)
                if (message) error.addIssue({ path: 'value', message })
            }
        } else error.addIssue({ path: 'value', expected: 'Set<string>', received: type })
        if (error.hasIssues()) return error
    }

    set value(v: Value) {
        if (this._options.default && v === undefined) v = this._options.default()
        if (this._options.transform) v = this._options.transform(v)
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

    get plain(): string[] | undefined {
        return this._value ? Array.from(this._value) : undefined
    }
}

export default StringSetType
