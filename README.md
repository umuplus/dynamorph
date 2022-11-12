# Dynamorph

It's a minimalist toolkit for aws dynamodb for AWS SDK v3.

It's not an ORM.
The main purpose is to make single table design smooth and easy with validators and converters through built-in types.

## Development Status

It's still in development

## Supported Types

Dynamorph is going to support various data types for DynamoDB such as simple types like String, Number, Boolean
and more complex types like List, Map, NumberSet, StringSet.

It will also support some advanced custom types like Timestamp, SoftDelete and UpdateToken.
These custom types also provide functionalities to change the data automatically when certain conditions occurred.

### Common Options

These options are available for most of the data types.
Some of them are conditionally available and they might end up with errors in parser implementations in the data types.

```typescript
enum KeyType {
    NUMBER = 'Number',
    STRING = 'String',
}

enum ComplexAttributeType {
    LIST = 'List',
    MAP = 'Map',
    NUMBER_SET = 'NumberSet',
    STRING_SET = 'StringSet',
}

enum CustomAttributeType {
    SOFT_DELETE = 'SoftDelete',
    TIMESTAMP = 'Timestamp',
    UPDATE_TOKEN = 'UpdateToken',
}

type AttributeType = KeyType | ComplexAttributeType | CustomAttributeType | 'Boolean'

interface Attribute {
    type: AttributeType
    fieldName?: string
    partitionKey?: boolean
    sortKey?: boolean
    ignore?: boolean
    required?: boolean
}
```

| Parameter     | Type                | Required            | Description         |
| ------------- | ------------------- | ------------------- | ------------------- |
| type          | AttributeType       | true                | The name of the type of the attribute
| fieldName     | string              | false               | Field's name to put the value into. If you don't provide, attribute's name will be used
| partitionKey  | boolean             | false               | Flag to determine whether the attribute is the partition key or not
| sortKey       | boolean             | false               | Flag to determine whether the attribute is the sort key or not
| ignore        | boolean             | false               | Set true, if you want to skip the attribute while saving the data to database
| required      | boolean             | false               | Flag to determine whether the attribute is required to fill or not

### Boolean

This type is for defining attributes to store boolean values.

**Options:**

```typescript
type BooleanBaseType = Omit<Attribute, 'type'>

interface BooleanOptions extends BooleanBaseType {
    validate?: (v: boolean | undefined) => string | undefined
    transform?: (v: boolean | undefined) => boolean | undefined
}
```

| Parameter     | Type                | Required            | Description         |
| ------------- | ------------------- | ------------------- | ------------------- |
| validate      | Function            | false               | Custom validator function. You can return custom error string from your validator
| transform     | Function            | false               | A custom function to overwrite the value

**Usages:**

```typescript
const attribute = new BooleanType({
    validate: (v: boolean | undefined) => (!v ? 'value must be true always' : undefined),
    transform: (v: boolean | undefined) => !!v,
})
attribute.value = true
```

### Number

This type is for defining attributes to store numeric values.

**Options:**

```typescript
type NumberBaseType = Omit<Attribute, 'type'>

interface NumberOptions extends NumberBaseType {
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    float?: boolean
    int?: boolean
    validate?: (v: number | undefined) => string | undefined
    transform?: (v: number | undefined) => number | undefined
}
```

| Parameter     | Type                | Required            | Description         |
| ------------- | ------------------- | ------------------- | ------------------- |
| lt            | number              | false               | Checks the value is less than the provided number
| lte           | number              | false               | Checks the value is less than or equal to the provided number
| gt            | number              | false               | Checks the value is greater than the provided number
| gte           | number              | false               | Checks the value is greater than or equal to the provided number
| float         | boolean             | false               | Flag to determine whether the attribute is a floating number or not
| int           | boolean             | false               | Flag to determine whether the attribute is an integer or not
| validate      | Function            | false               | Custom validator function. You can return custom error string from your validator
| transform     | Function            | false               | A custom function to overwrite the value

**Usages:**

```typescript
const attribute = new NumberType({
    lt: 5,
    lte: 5,
    gt: 15,
    gte: 15,
    float: false,
    int: true,
    validate: (v: number | undefined) => (v % 2 ? 'value must be a even number' : undefined),
    transform: (v: number | undefined) => v * v,
})
attribute.value = 10
```

### String

This type is for defining attributes to store string values.

**Options:**

```typescript
enum StringMode {
    EMAIL = 'email',
    ULID = 'ulid',
    URL = 'url',
}

type StringBaseType = Omit<Attribute, 'type'>

interface StringOptions extends StringBaseType {
    min?: number
    max?: number
    length?: number
    regex?: RegExp
    // TODO! enum?: string[]
    validate?: (v: string | undefined) => string | undefined
    transform?: (v: string | undefined) => string | undefined
    mode?: StringMode
    format?: string
}
```

| Parameter     | Type                | Required            | Description         |
| ------------- | ------------------- | ------------------- | ------------------- |
| min           | number              | false               | Checks length of the value is not less than the provided number
| max           | number              | false               | Checks length of the value is not greater than the provided number
| length        | number              | false               | Checks length of the value is equal to the provided number
| regex         | RegExp              | false               | Checks the value is matches with the provided regular expression
| validate      | Function            | false               | Custom validator function. You can return custom error string from your validator
| transform     | Function            | false               | A custom function to overwrite the value
| mode          | StringMode          | false               | Checks the value matches with the pre-defined mode
| format        | string              | false               | Determines the format of the value

**Usages:**

```typescript
const attribute = new StringType({
    min: 5,
    max: 5,
    length: 5,
    regex: /TEST/gi,
    validate: (v: string | undefined) => (v.includes('forbidden') ? 'value cannot contain the word "forbidden"' : undefined),
    transform: (v: string | undefined) => v.toUpperCase(),
})
attribute.value = 'test'

const attribute2 = new StringType({
    min: 10,
    max: 10,
    length: 10,
    mode: StringMode.EMAIL,
    format: '{username}@{domain}',
})
attribute2.value = { username: 'info', domain: 'example.com' }
```
