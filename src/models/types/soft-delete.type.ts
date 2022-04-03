import { Attribute, BaseClass } from './'

export class SoftDeleteType extends BaseClass {
    protected readonly _propertyName: string
    protected readonly _schema: Attribute
    protected _value: boolean | undefined = undefined
    protected _changed: boolean = false

    constructor(propertyName: string, schema?: Attribute, profileName?: string) {
        super(profileName)

        this._propertyName = propertyName
        this._schema = Attribute.parse(schema || {})

        Object.setPrototypeOf(this, SoftDeleteType.prototype)
    }

    get isChanged() {
        return this._changed
    }

    get schema() {
        return this._schema
    }

    get propertyName() {
        return this._propertyName
    }

    getValue() {
        return this._value
    }

    setValue(isDeleted?: boolean): boolean {
        this._value = !!isDeleted
        this._changed = true
        return true
    }
}
