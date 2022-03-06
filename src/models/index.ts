import { BaseClass } from './types/_'
import { GetCommand, GetCommandInput } from '@aws-sdk/lib-dynamodb'
import { ModelConfiguration } from './types'
import { NativeAttributeValue } from '@aws-sdk/util-dynamodb'
import { SoftDeleteType } from './types/soft-delete.type'
import { TimestampOn, TimestampType } from './types/timestamp.type'
import { UpdateTokenType } from './types/update-token.type'
import { StringType } from './types/string.type'

export type CompositeKey = { [key: string]: NativeAttributeValue }
export type Data = Record<string, any>

export class Model extends BaseClass {
    protected readonly _config: ModelConfiguration

    // * main attributes
    protected readonly _partitionKey: string
    protected _sortKey: string | undefined = undefined

    // * soft delete feature
    protected _softDelete: string[] = []

    // * update token feature
    protected _updateToken: string[] = []

    // * timestamp features
    protected _createdAt: string[] = []
    protected _updatedAt: string[] = []
    protected _deletedAt: string[] = []

    constructor(config: ModelConfiguration, profileName?: string) {
        super(profileName)

        this._config = ModelConfiguration.parse(config)
        this._partitionKey = Object.keys(this._config.schema).find((key) => this._config.schema[key].schema.partitionKey)!
        Object.keys(this._config.schema).forEach((key) => {
            const type = this._config.schema[key]
            if (type instanceof SoftDeleteType) this._softDelete.push(key)
            else if (type instanceof UpdateTokenType) this._updateToken.push(key)
            else if (type instanceof TimestampType) {
                if (type.schema['on'] === TimestampOn.Values.CREATE) this._createdAt.push(key)
                else if (type.schema['on'] === TimestampOn.Values.UPDATE) this._updatedAt.push(key)
                else if (type.schema['on'] === TimestampOn.Values.DELETE) this._deletedAt.push(key)
            }

            if (!this._sortKey && type.schema.sortKey) this._sortKey = key
        })

        Object.setPrototypeOf(this, Model.prototype)
    }

    get config() {
        return this._config
    }

    getKey(data: Data) {
        const key: any = {}
        const partitionKey = this._config.schema[this._partitionKey]
        const partitionKeyName = partitionKey.schema.fieldName || this._partitionKey
        if (partitionKey instanceof StringType) {
            if (partitionKey.hasFormat()) partitionKey.applyFormat(data)
            else partitionKey.setValue(data[this._partitionKey])
            key[partitionKeyName] = partitionKey.getValue()
        }
        const sortKey = this._sortKey ? this._config.schema[this._sortKey] : undefined
        const sortKeyName = sortKey?.schema.fieldName || this._sortKey
        if (this._sortKey && sortKeyName && sortKey instanceof StringType) {
            if (sortKey.hasFormat()) sortKey.applyFormat(data)
            else sortKey.setValue(data[this._sortKey])
            key[sortKeyName] = sortKey.getValue()
        }
        return key
    }

    getCommand(data: Data, customize?: Omit<GetCommandInput, 'TableName' | 'Key'>): GetCommand | undefined {
        const params = { TableName: this._config.tableName, Key: this.getKey(data) }
        return new GetCommand({ ...params, ...customize })
    }
}
