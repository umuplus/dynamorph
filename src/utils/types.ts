import { Exception } from './errors'

export enum KeyType {
    NUMBER = 'Number',
    STRING = 'String',
}

export enum ComplexAttributeType {
    LIST = 'List',
    MAP = 'Map',
    NUMBER_SET = 'NumberSet',
    STRING_SET = 'StringSet',
}

export enum CustomAttributeType {
    SOFT_DELETE = 'SoftDelete',
    TIMESTAMP = 'Timestamp',
    UPDATE_TOKEN = 'UpdateToken',
}

export type AttributeType = KeyType | ComplexAttributeType | CustomAttributeType | 'Boolean'

export interface Attribute {
    type: AttributeType
    fieldName?: string
    partitionKey?: boolean
    sortKey?: boolean
    ignore?: boolean
    required?: boolean
}

export abstract class BaseType {
    protected _changed = false
    protected _compositeAttributes: string[] = []
    protected _options: Record<string, any>
    protected _error: Exception | undefined = undefined

    constructor(options: Record<string, any>) {
        this._options = options
    }

    get error(): Exception | undefined {
        return this._error
    }

    get changed(): boolean {
        return this._changed
    }

    get fieldName(): string | undefined {
        return this._options.fieldName
    }

    get format(): string | undefined {
        return this._options.format
    }

    get ignore(): boolean | undefined {
        return this._options.ignore
    }
}
