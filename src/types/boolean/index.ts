import { Attribute, BaseType } from '../../utils/types'
import { Exception } from '../../utils/errors'
import { silent } from '../../utils/helpers'

type BooleanBaseType = Omit<Attribute, 'type'>

export interface BooleanOptions extends BooleanBaseType {
    validate?: (v: boolean | undefined) => string | undefined
    transform?: (v: boolean | undefined) => boolean | undefined
    default?: () => boolean
}

export class BooleanType extends BaseType {
    protected _value: boolean | undefined = undefined

    constructor(options: BooleanOptions) {
        super({ ...options, type: 'Boolean' })
    }

    protected parse(v: boolean | undefined): Exception | void {
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

    set value(v: boolean | undefined) {
        const error = this.parse(v as boolean)
        if (error) {
            if (!silent()) throw error

            if (this.error) this.error.addIssues(error.issues)
            else this._error = error
        } else {
            if (this._options.transform) v = this._options.transform(v)
            if (this._options.default && v === undefined) v = this._options.default()
            if (this._value !== v) {
                this._changed = true
                this._value = v
            }
        }
    }

    get value(): boolean | undefined {
        return this._value
    }

    get changed(): boolean {
        return this._changed
    }

    get fieldName(): string | undefined {
        return this._options.fieldName
    }
}

export default BooleanType
