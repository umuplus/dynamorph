import { Attribute, BaseType, CustomAttributeType } from '../../utils/types'
import { Exception } from '../../utils/errors'
import { silent } from '../../utils/helpers'

type SoftDeleteBaseType = Omit<Attribute, 'type'>

export interface SoftDeleteOptions extends SoftDeleteBaseType {
    validate?: (v: boolean) => string | undefined
    transform?: (v: boolean) => boolean
    default?: () => boolean
}

export class SoftDeleteType extends BaseType {
    protected _value: boolean = false

    constructor(options: SoftDeleteOptions) {
        super({ ...options, type: CustomAttributeType.SOFT_DELETE })

        if (!this._options.default) this._options.default = () => false
        this._options.partitionKey = false
        this._options.sortKey = false
        this._options.ignore = false
        this._options.required = true
    }

    protected parse(v: boolean): Exception | void {
        const error = new Exception()
        const type = typeof v
        const { validate } = this._options
        if (type === 'boolean') {
            if (validate) {
                const message = validate(v)
                if (message) error.addIssue({ path: 'value', message })
            }
        } else error.addIssue({ path: 'value', expected: 'boolean', received: type })
        if (error.hasIssues()) return error
    }

    set value(v: boolean) {
        if (v === undefined) v = this._options.default()
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

    get value(): boolean {
        return this._value
    }
}

export default SoftDeleteType
