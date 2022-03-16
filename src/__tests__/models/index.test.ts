import { Dynamorph, Data } from '../..'
import { SoftDeleteType } from '../../models/types/soft-delete.type'
import { StringType } from '../../models/types/string.type'
import { Timestamp, TimestampOn, TimestampType } from '../../models/types/timestamp.type'
import { UpdateTokenType } from '../../models/types/update-token.type'
import { config } from '../../utils/configuration'

class User extends Dynamorph {
    constructor(data: Data) {
        super(
            {
                modelName: 'User',
                tableName: 'MyUserTable',
                schema: [
                    new StringType('part', { partitionKey: true, fieldName: 'pk', format: 'ID#{userId}' }),
                    new StringType('sort', { sortKey: true, fieldName: 'sk' }),

                    new StringType('userId', { ignore: true }),

                    new TimestampType('createdAt', {
                        on: TimestampOn.Values.CREATE,
                        type: Timestamp.Values.ISO_STRING,
                        fieldName: '_cat',
                    }),

                    new UpdateTokenType('updateToken', { fieldName: '_token' }),
                    new TimestampType('updatedAt', {
                        on: TimestampOn.Values.UPDATE,
                        type: Timestamp.Values.ISO_STRING,
                        fieldName: '_uat',
                    }),

                    new SoftDeleteType('isDeleted', { fieldName: '_isd' }),
                    new TimestampType('deletedAt', {
                        on: TimestampOn.Values.DELETE,
                        type: Timestamp.Values.ISO_STRING,
                        fieldName: '_dat',
                    }),
                ],
            },
            data,
        )
    }
}

test('redefining attributes is wrong', () => {
    class InvalidUser extends Dynamorph {
        constructor(data: Data) {
            super(
                {
                    modelName: 'InvalidUser',
                    tableName: 'MyUserTable',
                    schema: [new StringType('userId', { ignore: true }), new StringType('id', { ignore: true })],
                },
                data,
            )
        }
    }
    expect(() => new InvalidUser({})).toThrow('You cannot redefine attributes.')
    expect(() => new InvalidUser({})).toThrow('You can have only one partition key and one optional sort key.')
})

test('basic model', () => {
    config.update({ safe: false, delimiter: '#' })
    const data = { userId: 'USER01', sort: 'SORT_KEY' }
    const user = new User(data)

    const key = user.key()
    expect(key).toEqual({ pk: 'ID#USER01', sk: 'SORT_KEY' })

    // * PutCommand
    const putCommand = user.putCommand()
    expect(putCommand?.input.TableName).toEqual('MyUserTable')
    expect(putCommand?.input.Item?.pk).toEqual('ID#USER01')
    expect(putCommand?.input.Item?.sk).toEqual('SORT_KEY')
    expect(!!putCommand?.input.Item?._cat).toEqual(true)
    expect(!isNaN(new Date(putCommand?.input.Item?._cat).getTime())).toEqual(true)
    expect(putCommand?.input.Item?._isd).toEqual(false)
    expect(putCommand?.input.Item?._token.length).toEqual(6)

    const putCommandCustom = user.putCommand({ ConditionExpression: '#invalid = :invalid' })
    expect(putCommandCustom?.input.ConditionExpression).toEqual('#invalid = :invalid')

    // * GetCommand
    const getCommand = user.getCommand()
    expect(getCommand?.input.TableName).toEqual('MyUserTable')
    expect(getCommand?.input.Key).toEqual({ pk: 'ID#USER01', sk: 'SORT_KEY' })

    const getCommandCustom = user.getCommand({ ProjectionExpression: 'pk' })
    expect(getCommandCustom?.input.ProjectionExpression).toEqual('pk')

    // * DeleteCommand
    const deleteCommand = user.deleteCommand()
    expect(deleteCommand?.input.TableName).toEqual('MyUserTable')
    expect(deleteCommand?.input.Key).toEqual({ pk: 'ID#USER01', sk: 'SORT_KEY' })

    const deleteCommandCustom = user.deleteCommand({ ReturnConsumedCapacity: 'TOTAL' })
    expect(deleteCommandCustom?.input.ReturnConsumedCapacity).toEqual('TOTAL')

    // * Soft Delete via UpdateCommand
    const softDeleteCommand = user.softDeleteCommand()
    expect(softDeleteCommand?.input.UpdateExpression).toEqual('SET #_isd = :_isd, #_dat = :_dat, #_token = :_token')
    expect(softDeleteCommand?.input.ConditionExpression).toEqual('#ce__token = :ce__token')
    expect(softDeleteCommand?.input.ExpressionAttributeValues?.[':_isd']).toEqual(true)
    expect(softDeleteCommand?.input.ExpressionAttributeValues?.[':ce__token']).not.toEqual(
        softDeleteCommand?.input.ExpressionAttributeValues?.[':_token'],
    )
})
