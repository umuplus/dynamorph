import { Attribute, BaseType, ComplexAttributeType } from '../../utils/types'
import { Exception } from '../../utils/errors'
import { silent } from '../../utils/helpers'

type NumberSetBaseType = Omit<Attribute, 'type'>
type Value = Set<number> | undefined

export interface NumberSetOptions extends NumberSetBaseType {
    min?: number
    max?: number
    size?: number
    validate?: (v: Value) => string | undefined
    transform?: (v: Value) => Value
    default?: () => Set<number>
}

export class NumberSetType extends BaseType {
    protected _value: Value = undefined

    constructor(options: NumberSetOptions) {
        super({ ...options, type: ComplexAttributeType.LIST })
    }

    protected parse(v: Value): Exception | void {
        const error = new Exception()
        const type = typeof v
        const { min, max, length, validate } = this._options
        if (type === 'undefined') {
            if (this._options.required) error.addIssue({ path: 'value', expected: 'array', received: type })
        } else if (v instanceof Set) {
            if (min !== undefined && v!.size < min) error.addIssue({ path: 'size', expected: `${min}<=`, received: v?.size })
            if (max !== undefined && v!.size > max) error.addIssue({ path: 'size', expected: `<=${max}`, received: v?.size })
            if (length !== undefined && v!.size !== length) error.addIssue({ path: 'size', expected: length, received: v?.size })

            if (validate) {
                const message = validate(v)
                if (message) error.addIssue({ path: 'value', message })
            }
        } else error.addIssue({ path: 'value', expected: 'array', received: type })
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

    get plain(): number[] | undefined {
        return this._value ? Array.from(this._value) : undefined
    }

    get changed(): boolean {
        return this._changed
    }
}

export default NumberSetType
