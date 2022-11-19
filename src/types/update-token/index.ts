import { Attribute, BaseType, CustomAttributeType } from '../../utils/types'
import { Exception } from '../../utils/errors'
import { generateToken, silent, updateTokenLength } from '../../utils/helpers'

type UpdateTokenBaseType = Omit<Attribute, 'type'>

export interface UpdateTokenOptions extends UpdateTokenBaseType {
    length?: number
}

export class UpdateTokenType extends BaseType {
    protected _value: string

    constructor(options: UpdateTokenOptions) {
        super({ ...options, type: CustomAttributeType.SOFT_DELETE })

        this._options.partitionKey = false
        this._options.sortKey = false
        this._options.ignore = false
        this._options.required = true

        this._value = generateToken(updateTokenLength(this._options.length))
        this._changed = true
    }

    protected parse(v: string): Exception | void {
        const error = new Exception()
        const type = typeof v
        if (type === 'string') {
            const length = updateTokenLength(this._options.length)
            if (v.length !== length) error.addIssue({ path: 'length', expected: length, received: v.length })
        } else error.addIssue({ path: 'value', expected: 'string', received: type })
        if (error.hasIssues()) return error
    }

    set value(v: string) {
        const error = this.parse(v)
        if (error) {
            if (!silent()) throw error

            if (this.error) this.error.addIssues(error.issues)
            else this._error = error
        } else if (this._value !== v) {
            this._changed = true
            this._value = v.substring(0, updateTokenLength(this._options.length))
        }
    }

    get value(): string {
        return this._value
    }

    reset(): void {
        this._value = generateToken(updateTokenLength(this._options.length))
        this._changed = true
    }
}

export default UpdateTokenType
