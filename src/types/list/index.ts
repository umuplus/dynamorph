import { Attribute, BaseType, ComplexAttributeType } from '../../utils/types'
import { Exception } from '../../utils/errors'
import { silent } from '../../utils/helpers'

type ListBaseType = Omit<Attribute, 'type'>
type Value = any[] | undefined

export interface ListOptions extends ListBaseType {
    min?: number
    max?: number
    size?: number
    validate?: (v: Value) => string | undefined
    transform?: (v: Value) => Value
    default?: () => any[]
}

export class ListType extends BaseType {
    protected _value: Value = undefined

    constructor(options: ListOptions) {
        super({ ...options, type: ComplexAttributeType.LIST })
    }

    protected parse(v: Value): Exception | void {
        const error = new Exception()
        const type = typeof v
        const { min, max, size, validate } = this._options
        if (type === 'undefined') {
            if (this._options.required) error.addIssue({ path: 'value', expected: 'array', received: type })
        } else if (Array.isArray(v)) {
            if (min !== undefined && v!.length < min)
                error.addIssue({ path: 'size', expected: `${min}<=`, received: v?.length })
            if (max !== undefined && v!.length > max)
                error.addIssue({ path: 'size', expected: `<=${max}`, received: v?.length })
            if (size !== undefined && v!.length !== size)
                error.addIssue({ path: 'size', expected: size, received: v?.length })

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
}

export default ListType
