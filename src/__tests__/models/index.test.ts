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
        }
    })
    expect(model.config.schema.part.schema.partitionKey).toEqual(true)
    expect(model.config.schema.part.schema.fieldName).toEqual('pk')
    expect(model.config.schema.userId.schema.ignore).toEqual(true)
})
