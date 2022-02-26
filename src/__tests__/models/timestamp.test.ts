import { Timestamp, TimestampOn, TimestampType } from '../../models/types/timestamp.type'

test('basic timestamp attribute', () => {
    const timestamp = new TimestampType({ on: TimestampOn.Values.CREATE, type: Timestamp.Values.ISO_STRING })
    const val = new Date().toISOString()
    timestamp.setValue(val)
    expect(timestamp instanceof TimestampType).toEqual(true)
    expect(timestamp.getValue()).toEqual(val)
})

test('timestamp attribute in milliseconds', () => {
    const timestamp = new TimestampType({ on: TimestampOn.Values.CREATE, type: Timestamp.Values.MILLISECONDS })
    const val = new Date().getTime()
    timestamp.setValue(val)
    expect(timestamp.getValue()).toEqual(val)
})

test('timestamp attribute in seconds', () => {
    const timestamp = new TimestampType({ on: TimestampOn.Values.CREATE, type: Timestamp.Values.SECONDS })
    const val = Math.floor(new Date().getTime() / 1000)
    timestamp.setValue(val)
    expect(timestamp.getValue()).toEqual(val)
})
