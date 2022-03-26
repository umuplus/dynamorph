import { AllTypesTogether, ModelConfiguration } from './models'
import { BaseClass } from './models/types'
import { DeleteCommand, DeleteCommandInput } from '@aws-sdk/lib-dynamodb'
import { GetCommand, GetCommandInput } from '@aws-sdk/lib-dynamodb'
import { NativeAttributeValue } from '@aws-sdk/util-dynamodb'
import { NumberType } from './models/types/number.type'
import { PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb'
import { SoftDeleteType } from './models/types/soft-delete.type'
import { StringType } from './models/types/string.type'
import { TimestampOn, TimestampType } from './models/types/timestamp.type'
import { UpdateCommand, UpdateCommandInput } from '@aws-sdk/lib-dynamodb'
import { UpdateTokenType } from './models/types/update-token.type'
import { ZodError } from 'zod'

export type CompositeKey = { [key: string]: NativeAttributeValue }
export type Data = Record<string, any>
export type SoftDeleteInput = Omit<
    UpdateCommandInput,
    'TableName' | 'Key' | 'UpdateExpression' | 'ConditionExpression' | 'ExpressionAttributeNames' | 'ExpressionAttributeValues'
>

export abstract class Dynamorph extends BaseClass {
    protected readonly _config: ModelConfiguration

    // * main attributes
    protected readonly _partitionKey: StringType
    protected _sortKey: StringType | undefined = undefined

    // * soft delete feature
    protected _softDelete: SoftDeleteType[] = []

    // * update token feature
    protected _updateToken: UpdateTokenType[] = []

    // * timestamp features
    protected _createdAt: TimestampType[] = []
    protected _updatedAt: TimestampType[] = []
    protected _deletedAt: TimestampType[] = []

    protected _data: Data = {}

    constructor(config: ModelConfiguration, data: Data, profileName?: string) {
        super(profileName)

        this._config = ModelConfiguration.parse(config)
        // TODO! validate data against schema (dynamically)
        this._data = data

        // * partition key
        this._partitionKey = this._config.schema.find((type) => {
            const key = type.propertyName
            if (type.schema.partitionKey && type instanceof StringType) {
                if (!type.setValue(type.hasFormat() ? this._data : this._data[key])) {
                    this._wrapError({ success: false, error: type.getErrors() })
                    return false
                }
                return true
            }
            return false
        }) as StringType
        if (!this._partitionKey)
            this._wrapError({
                success: false,
                error: new ZodError([
                    {
                        code: 'custom',
                        path: [],
                        message: 'There is no proper partition key.',
                    },
                ]),
            })

        // * other attributes
        this._config.schema.forEach((type) => {
            const fieldName = type.schema.fieldName || type.propertyName
            if (type instanceof SoftDeleteType) {
                type.setValue(this._data[fieldName] || this._data[type.propertyName])
                this._softDelete.push(type)
            } else if (type instanceof UpdateTokenType) {
                type.setValue(this._data[fieldName] || this._data[type.propertyName])
                this._updateToken.push(type)
            } else if (type instanceof TimestampType) {
                type.setValue(this._data[fieldName] || this._data[type.propertyName])
                if (type.schema['on'] === TimestampOn.Values.CREATE) this._createdAt.push(type)
                else if (type.schema['on'] === TimestampOn.Values.UPDATE) this._updatedAt.push(type)
                else if (type.schema['on'] === TimestampOn.Values.DELETE) this._deletedAt.push(type)
            } else if (type instanceof NumberType) {
                if (!type.setValue(this._data[this._data[fieldName] || this._data[type.propertyName]]))
                    this._wrapError({ success: false, error: type.getErrors() })
            } else if (type instanceof StringType) {
                if (!type.setValue(type.hasFormat() ? this._data : this._data[fieldName] || this._data[type.propertyName]))
                    this._wrapError({ success: false, error: type.getErrors() })

                if (!this._sortKey && type.schema.sortKey) this._sortKey = type
            }
        })

        Object.setPrototypeOf(this, Dynamorph.prototype)
    }

    protected addAttribute(attribute: AllTypesTogether, after?: string) {
        const addTypeAfter: number = after ? this._config.schema.findIndex((type) => type.propertyName === after) || -1 : -1
        if (!this._config.schema.find((type) => type.propertyName === attribute.propertyName)) {
            if (addTypeAfter === -1 || addTypeAfter + 1 === this._config.schema.length - 1)
                this._config.schema.push(AllTypesTogether.parse(attribute))
            else this._config.schema.splice(addTypeAfter + 1, 0, attribute)
        }
    }

    protected removeAttribute(name: string) {
        const index = this._config.schema.findIndex((type) => type.propertyName === name)
        if (index !== -1) this._config.schema.splice(index, 1)
    }

    get config() {
        return this._config
    }

    key() {
        const key: any = {}
        const partitionKeyName = this._partitionKey.schema.fieldName || this._partitionKey.propertyName
        key[partitionKeyName] = this._partitionKey.getValue()

        const sortKeyName = this._sortKey?.schema.fieldName || this._sortKey?.propertyName
        if (this._sortKey && sortKeyName) key[sortKeyName] = this._sortKey.getValue()
        return key
    }

    item() {
        let item: any = this.key()
        if (this._updateToken.length)
            item = this._updateToken.reduce((output, type) => {
                const fieldName = type.schema.fieldName || type.propertyName
                output[fieldName] = type.getValue()
                return output
            }, item)

        if (this._softDelete.length)
            item = this._softDelete.reduce((output, type) => {
                const fieldName = type.schema.fieldName || type.propertyName
                output[fieldName] = type.getValue()
                return output
            }, item)

        if (this._createdAt.length)
            item = this._createdAt.reduce((output, type) => {
                const fieldName = type.schema.fieldName || type.propertyName
                output[fieldName] = type.getValue()
                return output
            }, item)

        item = this._config.schema.reduce((output, type) => {
            if (output[type.propertyName] || type.schema.ignore) return output

            const fieldName = type.schema.fieldName || type.propertyName
            output[fieldName] = type.getValue()
            return output
        }, item)
        return item
    }

    putCommand(customize?: Omit<PutCommandInput, 'TableName' | 'Item'>): PutCommand | undefined {
        const params: PutCommandInput = { TableName: this._config.tableName, Item: this.item() }
        return new PutCommand({ ...params, ...customize })
    }

    getCommand(customize?: Omit<GetCommandInput, 'TableName' | 'Key'>): GetCommand | undefined {
        const params: GetCommandInput = { TableName: this._config.tableName, Key: this.key() }
        return new GetCommand({ ...params, ...customize })
    }

    deleteCommand(customize?: Omit<DeleteCommandInput, 'TableName' | 'Key'>): DeleteCommand | undefined {
        const params: DeleteCommandInput = { TableName: this._config.tableName, Key: this.key() }
        return new DeleteCommand({ ...params, ...customize })
    }

    softDeleteCommand(isDeleted = true, customize?: SoftDeleteInput): UpdateCommand | undefined {
        if (!this._softDelete.length) {
            this._wrapError({
                success: false,
                error: new ZodError([
                    {
                        code: 'custom',
                        path: [],
                        message: 'Format does not match',
                    },
                ]),
            })
            return undefined
        }

        const conditionExpression: string[] = []

        const updateExpression: string[] = []
        const ExpressionAttributeNames: Record<string, string> = {}
        const ExpressionAttributeValues: Record<string, any> = {}

        this._softDelete.forEach((type) => {
            if (type instanceof SoftDeleteType) {
                const fieldName = type.schema.fieldName || type.propertyName
                updateExpression.push(`#${fieldName} = :${fieldName}`)
                ExpressionAttributeNames[`#${fieldName}`] = fieldName
                ExpressionAttributeValues[`:${fieldName}`] = !!isDeleted
            }
        })
        if (isDeleted) {
            this._deletedAt.forEach((type) => {
                if (type instanceof TimestampType) {
                    if (type.setValue(new Date())) {
                        const fieldName = type.schema.fieldName || type.propertyName
                        updateExpression.push(`#${fieldName} = :${fieldName}`)
                        ExpressionAttributeNames[`#${fieldName}`] = fieldName
                        ExpressionAttributeValues[`:${fieldName}`] = type.getValue()
                    } else this._wrapError({ success: false, error: type.getErrors() })
                }
            })
        } else {
            this._updatedAt.forEach((type) => {
                if (type instanceof TimestampType) {
                    if (type.setValue(new Date())) {
                        const fieldName = type.schema.fieldName || type.propertyName
                        updateExpression.push(`#${fieldName} = :${fieldName}`)
                        ExpressionAttributeNames[`#${fieldName}`] = fieldName
                        ExpressionAttributeValues[`:${fieldName}`] = type.getValue()
                    } else this._wrapError({ success: false, error: type.getErrors() })
                }
            })
        }

        this._updateToken.forEach((type) => {
            if (type instanceof UpdateTokenType) {
                const fieldName = type.schema.fieldName || type.propertyName
                const currentToken = type.getValue()
                if (currentToken) {
                    conditionExpression.push(`#ce_${fieldName} = :ce_${fieldName}`)
                    ExpressionAttributeNames[`#ce_${fieldName}`] = fieldName
                    ExpressionAttributeValues[`:ce_${fieldName}`] = currentToken
                }

                type.setValue()
                updateExpression.push(`#${fieldName} = :${fieldName}`)
                ExpressionAttributeNames[`#${fieldName}`] = fieldName
                ExpressionAttributeValues[`:${fieldName}`] = type.getValue()
            }
        })

        const params: UpdateCommandInput = {
            TableName: this._config.tableName,
            Key: this.key(),
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ConditionExpression: conditionExpression.length ? conditionExpression.join(' AND ') : undefined,
            ExpressionAttributeNames,
            ExpressionAttributeValues,
        }
        return new UpdateCommand({ ...params, ...customize })
    }
}

export default Dynamorph
