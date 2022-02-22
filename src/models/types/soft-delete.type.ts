import { Attribute, BaseClass } from './_'

export class SoftDeleteType extends BaseClass {
    private readonly _schema: Attribute
    private _value: boolean | undefined = undefined

    constructor(schema: Attribute, profileName?: string) {
        super(profileName)

        this._schema = Attribute.parse(schema)

        Object.setPrototypeOf(this, SoftDeleteType.prototype)
    }

    get schema() {
        return this._schema
    }

    getValue() {
        return this._value
    }

    setValue(isDeleted?: boolean): boolean {
        this._value = !!isDeleted
        return true
    }
}
