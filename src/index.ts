import { BaseClass } from './models/types'
import { DeleteCommand, DeleteCommandInput } from '@aws-sdk/lib-dynamodb'
import { GetCommand, GetCommandInput } from '@aws-sdk/lib-dynamodb'
import { PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb'
import { ModelConfiguration } from './models'
import { NativeAttributeValue } from '@aws-sdk/util-dynamodb'
import { SoftDeleteType } from './models/types/soft-delete.type'
import { TimestampOn, TimestampType } from './models/types/timestamp.type'
import { UpdateTokenType } from './models/types/update-token.type'
import { StringType } from './models/types/string.type'
import { NumberType } from './models/types/number.type'

export type CompositeKey = { [key: string]: NativeAttributeValue }
export type Data = Record<string, any>

export class Dynamorph extends BaseClass {
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

        Object.setPrototypeOf(this, Dynamorph.prototype)
    }

    get config() {
        return this._config
    }

    key(data: Data) {
        const key: any = {}
        const partitionKey = this._config.schema[this._partitionKey]
        const partitionKeyName = partitionKey.schema.fieldName || this._partitionKey
        if (partitionKey instanceof StringType) {
            if (partitionKey.hasFormat()) partitionKey.setValue(data)
            else partitionKey.setValue(data[this._partitionKey])
            key[partitionKeyName] = partitionKey.getValue()
        }
        const sortKey = this._sortKey ? this._config.schema[this._sortKey] : undefined
        const sortKeyName = sortKey?.schema.fieldName || this._sortKey
        if (this._sortKey && sortKeyName && sortKey instanceof StringType) {
            if (sortKey.hasFormat()) sortKey.setValue(data)
            else sortKey.setValue(data[this._sortKey])
            key[sortKeyName] = sortKey.getValue()
        }
        return key
    }

    item(data: Data) {
        let item: any = this.key(data)
        if (this._updateToken.length)
            item = this._updateToken.reduce((output, key) => {
                const type = this._config.schema[key]
                if (type instanceof UpdateTokenType) {
                    type.setValue()
                    const fieldName = type.schema.fieldName || key
                    output[fieldName] = type.getValue()
                }
                return output
            }, item)

        if (this._softDelete.length)
            item = this._softDelete.reduce((output, key) => {
                const type = this._config.schema[key]
                if (type instanceof SoftDeleteType) {
                    type.setValue(false)
                    const fieldName = type.schema.fieldName || key
                    output[fieldName] = type.getValue()
                }
                return output
            }, item)

        if (this._createdAt.length)
            item = this._createdAt.reduce((output, key) => {
                const type = this._config.schema[key]
                if (type instanceof TimestampType) {
                    type.setValue(new Date())
                    const fieldName = type.schema.fieldName || key
                    output[fieldName] = type.getValue()
                }
                return output
            }, item)

        item = Object.keys(this._config.schema).reduce((output, key) => {
            const type = this._config.schema[key]
            if (output[key] || type.schema.ignore) return output

            if (type instanceof StringType) {
                type.setValue(type.hasFormat() ? data : data[key])
                const fieldName = type.schema.fieldName || key
                output[fieldName] = type.getValue()
            }
            else if (type instanceof NumberType) {
                type.setValue(data[key])
                const fieldName = type.schema.fieldName || key
                output[fieldName] = type.getValue()
            }

            return output
        }, item)
        return item
    }

    putCommand(data: Data, customize?: Omit<PutCommandInput, 'TableName' | 'Item'>): PutCommand | undefined {
        const params = { TableName: this._config.tableName, Item: this.item(data) }
        return new PutCommand({ ...params, ...customize })
    }

    getCommand(data: Data, customize?: Omit<GetCommandInput, 'TableName' | 'Key'>): GetCommand | undefined {
        const params = { TableName: this._config.tableName, Key: this.key(data) }
        return new GetCommand({ ...params, ...customize })
    }

    deleteCommand(data: Data, customize?: Omit<DeleteCommandInput, 'TableName' | 'Key'>): DeleteCommand | undefined {
        const params = { TableName: this._config.tableName, Key: this.key(data) }
        return new DeleteCommand({ ...params, ...customize })
    }
}

export default Dynamorph
