import { Attribute, BaseType, KeyType } from '../../utils/types'
import { Exception } from '../../utils/errors'
import { isFloat, isInt } from '../../utils/validator'
import { silent } from '../../utils/helpers'

type NumberBaseType = Omit<Attribute, 'type'>

export interface NumberOptions extends NumberBaseType {
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    float?: boolean
    int?: boolean
    validate?: (v: number | undefined) => string | undefined
    transform?: (v: number | undefined) => number | undefined
    default?: () => number
}

export class NumberType extends BaseType {
    protected _value: number | undefined = undefined

    constructor(options: NumberOptions) {
        super({ ...options, type: KeyType.NUMBER })
    }

    protected parse(v: number | undefined): Exception | void {
        const error = new Exception()
        const type = typeof v
        const { lt, lte, gt, gte, float, int, validate } = this._options
        if (type === 'undefined') {
            if (this._options.required) error.addIssue({ path: 'value', expected: 'number', received: type })
        } else if (type === 'number') {
            if (lt !== undefined && v! >= lt) error.addIssue({ path: 'value', expected: `<${lt}`, received: v })
            if (lte !== undefined && v! > lte) error.addIssue({ path: 'value', expected: `<=${lte}`, received: v })
            if (gt !== undefined && v! <= gt) error.addIssue({ path: 'value', expected: `>${gt}`, received: v })
            if (gte !== undefined && v! < gte) error.addIssue({ path: 'value', expected: `>=${gte}`, received: v })

            if (float && !isFloat(v!)) error.addIssue({ path: 'value', expected: `float`, received: 'integer' })
            else if (int && !isInt(v!)) error.addIssue({ path: 'value', expected: `integer`, received: 'float' })

            if (validate) {
                const message = validate(v)
                if (message) error.addIssue({ path: 'value', message })
            }
        } else error.addIssue({ path: 'value', expected: 'number', received: type })
        if (error.hasIssues()) return error
    }

    set value(v: number | undefined) {
        const error = this.parse(v as number)
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

    get value(): number | undefined {
        return this._value
    }

    get changed(): boolean {
        return this._changed
    }

    get fieldName(): string | undefined {
        return this._options.fieldName
    }
}

export default NumberType
