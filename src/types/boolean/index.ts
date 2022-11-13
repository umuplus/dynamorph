import { Attribute, BaseType } from '../../utils/types'
import { Exception } from '../../utils/errors'
import { silent } from '../../utils/helpers'

type BooleanBaseType = Omit<Attribute, 'type'>
type Value = boolean | undefined

export interface BooleanOptions extends BooleanBaseType {
    validate?: (v: Value) => string | undefined
    transform?: (v: Value) => Value
    default?: () => boolean
}

export class BooleanType extends BaseType {
    protected _value: Value = undefined

    constructor(options: BooleanOptions) {
        super({ ...options, type: 'Boolean' })
    }

    protected parse(v: Value): Exception | void {
        const error = new Exception()
        const type = typeof v
        const { partitionKey, sortKey, validate } = this._options
        if (type === 'undefined') {
            if (this._options.required) error.addIssue({ path: 'value', expected: 'boolean', received: type })
        } else if (type === 'boolean') {
            if (validate) {
                const message = validate(v)
                if (message) error.addIssue({ path: 'value', message })
            }
            if (partitionKey)
                error.addIssue({ path: 'PartitionKey', expected: `string|number`, received: 'boolean', message: 'Partition key cannot be a boolean' })
            if (sortKey) error.addIssue({ path: 'SortKey', expected: `string|number`, received: 'boolean', message: 'Sort key cannot be a boolean' })
        } else error.addIssue({ path: 'value', expected: 'boolean', received: type })
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

    get changed(): boolean {
        return this._changed
    }
}

export default BooleanType
