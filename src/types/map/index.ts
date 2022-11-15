import { Attribute, BaseType, ComplexAttributeType } from '../../utils/types'
import { Exception } from '../../utils/errors'
import { silent } from '../../utils/helpers'

type MapBaseType = Omit<Attribute, 'type'>
type Value = Record<string, any> | undefined

export interface MapOptions extends MapBaseType {
    validate?: (v: Value) => string | undefined
    transform?: (v: Value) => Value
    default?: () => Record<string, any>
}

export class MapType extends BaseType {
    protected _value: Value = undefined

    constructor(options: MapOptions) {
        super({ ...options, type: ComplexAttributeType.MAP })
    }

    protected parse(v: Value): Exception | void {
        const error = new Exception()
        const type = typeof v
        const { validate } = this._options
        if (type === 'undefined') {
            if (this._options.required) error.addIssue({ path: 'value', expected: 'map', received: type })
        } else {
            if (type === 'object') {
                const isNull = v === null ? 'null' : undefined
                const isArray = Array.isArray(v) ? 'array' : undefined
                const isDate = v instanceof Date ? 'date' : undefined
                const isRegExp = v instanceof RegExp ? 'regexp' : undefined
                if (!isArray && !isNull && !isDate && !isRegExp) {
                    if (validate) {
                        const message = validate(v)
                        if (message) error.addIssue({ path: 'value', message })
                    }
                } else error.addIssue({ path: 'value', expected: 'object', received: isArray || isNull || isDate || isRegExp })
            } else error.addIssue({ path: 'value', expected: 'object', received: type })
        }
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

export default MapType
