import { Attribute, BaseType, KeyType } from '../../utils/types'
import { Exception } from '../../utils/errors'
import { applyFormat, findCompositeAttributes } from '../../utils/format'
import { isEmail, isUlid, isUrl } from '../../utils/validator'
import { silent } from '../../utils/helpers'

export enum StringMode {
    EMAIL = 'email',
    ULID = 'ulid',
    URL = 'url',
}

type StringBaseType = Omit<Attribute, 'type'>

export interface StringOptions extends StringBaseType {
    min?: number
    max?: number
    length?: number
    regex?: RegExp
    // TODO! enum?: string[]
    validate?: (v: string | undefined) => string | undefined
    transform?: (v: string | undefined) => string | undefined
    mode?: StringMode
    format?: string
}

export class StringType extends BaseType {
    protected _value: string | undefined = undefined

    constructor(options: StringOptions) {
        super({ ...options, type: KeyType.STRING })

        this._compositeAttributes = this._options.format ? findCompositeAttributes(this._options.format) : []
    }

    protected parse(v: string | undefined): Exception | void {
        const error = new Exception()
        const type = typeof v
        const { min, max, length, regex, mode, validate } = this._options
        if (type === 'undefined') {
            if (this._options.required) error.addIssue({ path: 'value', expected: 'string', received: type })
        } else if (type === 'string') {
            if (min !== undefined && v!.length < min) error.addIssue({ path: 'length', expected: `${min}<=`, received: v?.length })
            if (max !== undefined && v!.length > max) error.addIssue({ path: 'length', expected: `<=${max}`, received: v?.length })
            if (length !== undefined && v!.length !== length) error.addIssue({ path: 'length', expected: length, received: v?.length })
            if (regex !== undefined && !regex.test(v!)) error.addIssue({ path: 'regex', expected: `${regex}`, received: v })

            if (mode === StringMode.ULID && !isUlid(v)) error.addIssue({ path: 'mode', expected: 'ulid', received: v })
            else if (mode === StringMode.EMAIL && !isEmail(v)) error.addIssue({ path: 'mode', expected: 'email', received: v })
            else if (mode === StringMode.URL && !isUrl(v)) error.addIssue({ path: 'mode', expected: 'url', received: v })

            if (validate) {
                const message = validate(v)
                if (message) error.addIssue({ path: 'value', message })
            }
        }
        if (error.hasIssues()) return error
    }

    set value(v: string | Record<string, any> | undefined) {
        let error: Exception | void
        let value: string | undefined = undefined
        if (!this._options.format) {
            if (typeof v === 'string' || typeof v === 'undefined') {
                value = v
                error = this.parse(v as string)
            } else {
                error = new Exception({
                    path: 'value',
                    expected: 'string',
                    received: typeof v,
                    message: '"value" must be a "string" when there is no "format"',
                })
            }
        } else {
            if (typeof v === 'string' || typeof v === 'undefined') {
                error = new Exception({
                    path: 'value',
                    expected: 'object',
                    received: typeof v,
                    message: '"value" must be an "object" when there is a "format"',
                })
            } else {
                value = applyFormat(this._options.format, v)
                error = this.parse(value)
            }
        }
        if (error) {
            if (!silent()) throw error

            if (this.error) this.error.addIssues(error.issues)
            else this._error = error
        } else {
            if (this._options.transform) value = this._options.transform(value)
            if (this._value !== value) {
                this._changed = true
                this._value = value
            }
        }
    }

    get value(): string | undefined {
        return this._value
    }

    get changed(): boolean {
        return this._changed
    }

    get fieldName(): string | undefined {
        return this._options.fieldName
    }

    get compositeAttributes(): string[] {
        return this._compositeAttributes
    }
}

export default StringType
