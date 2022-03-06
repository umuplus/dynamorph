import { Model } from '../../models'
import { SoftDeleteType } from '../../models/types/soft-delete.type'
import { StringType } from '../../models/types/string.type'
import { Timestamp, TimestampOn, TimestampType } from '../../models/types/timestamp.type'
import { UpdateTokenType } from '../../models/types/update-token.type'
import { config } from '../../utils/configuration'

test('basic model', () => {
    config.update({ safe: false, delimiter: '|' })
    const model = new Model({
        modelName: 'User',
        tableName: 'MyUserTable',
        schema: {
            part: new StringType({ partitionKey: true, fieldName: 'pk', format: 'ID#{userId}' }),
            sort: new StringType({ sortKey: true, fieldName: 'sk' }),

            userId: new StringType({ ignore: true }),

            createdAt: new TimestampType({ on: TimestampOn.Values.CREATE, type: Timestamp.Values.ISO_STRING, fieldName: '_cat' }),

            updateToken: new UpdateTokenType({ fieldName: '_token' }),
            updatedAt: new TimestampType({ on: TimestampOn.Values.UPDATE, type: Timestamp.Values.ISO_STRING, fieldName: '_uat' }),

            isDeleted: new SoftDeleteType({ fieldName: '_isd' }),
            deletedAt: new TimestampType({ on: TimestampOn.Values.DELETE, type: Timestamp.Values.ISO_STRING, fieldName: '_dat' }),
        },
    })

    const data = { userId: 'USER01', sort: 'SORT_KEY' }
    const key = model.getKey(data)
    const getCommand = model.getCommand(data)
    expect(key).toEqual({ pk: 'ID#USER01', sk: 'SORT_KEY' })
    expect(getCommand?.input.TableName).toEqual('MyUserTable')
    expect(getCommand?.input.Key).toEqual({ pk: 'ID#USER01', sk: 'SORT_KEY' })

    const getCommandWithProjection = model.getCommand(data, { ProjectionExpression: 'pk' })
    expect(getCommandWithProjection?.input.ProjectionExpression).toEqual('pk')
})
