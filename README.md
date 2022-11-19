# Dynamorph

It's a minimalist toolkit for aws dynamodb for AWS SDK v3.

It's not an ORM.
The main purpose is to make single table design smooth and easy with validators and converters through built-in types.

## Development Status

It's a weekend-only project and still in development.

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
    default?: () => boolean
}
```

| Parameter     | Type                | Required            | Description         |
| ------------- | ------------------- | ------------------- | ------------------- |
| validate      | Function            | false               | Custom validator function. You can return custom error string from your validator
| transform     | Function            | false               | A custom function to overwrite the value
| default       | Function            | false               | A custom function to set the default value

**Usages:**

```typescript
const attribute = new BooleanType({
    validate: (v: boolean | undefined) => (!v ? 'value must be true always' : undefined),
    transform: (v: boolean | undefined) => !!v,
    default: () => true
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
    default?: () => number
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
| default       | Function            | false               | A custom function to set the default value

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
    default: () => Math.random(),
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
    validate?: (v: string | undefined) => string | undefined
    transform?: (v: string | undefined) => string | undefined
    default?: () => string
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
| default       | Function            | false               | A custom function to set the default value
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
    default: () => '?'
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

### List

This type is for defining attributes to store list values.

**Options:**

```typescript
type ListBaseType = Omit<Attribute, 'type'>

export interface ListOptions extends ListBaseType {
    min?: number
    max?: number
    size?: number
    validate?: (v: any[] | undefined) => string | undefined
    transform?: (v: any[] | undefined) => any[] | undefined
    default?: () => any[]
}
```

| Parameter     | Type                | Required            | Description         |
| ------------- | ------------------- | ------------------- | ------------------- |
| min           | number              | false               | Checks length of the value is not less than the provided number
| max           | number              | false               | Checks length of the value is not greater than the provided number
| size          | number              | false               | Checks length of the value is equal to the provided number
| validate      | Function            | false               | Custom validator function. You can return custom error string from your validator
| transform     | Function            | false               | A custom function to overwrite the value
| default       | Function            | false               | A custom function to set the default value

**Usages:**

```typescript
const attribute = new ListType({
    min: 1,
    max: 5,
    size: 3,
    validate: (v: any[] | undefined) => (v.length % 2 ? 'number of items in the value must be even' : undefined),
    transform: (v: any[] | undefined) => v.map(k => k?.toUpperCase() || k),
    default: () => [],
})
attribute.value = ['a', 'b', 'c']
```

### Map

This type is for defining attributes to store map (object) values.

**Options:**

```typescript
type MapBaseType = Omit<Attribute, 'type'>

export interface MapOptions extends MapBaseType {
    validate?: (v: Record<string, any> | undefined) => string | undefined
    transform?: (v: Record<string, any> | undefined) => Record<string, any> | undefined
    default?: () => Record<string, any>
}
```

| Parameter     | Type                | Required            | Description         |
| ------------- | ------------------- | ------------------- | ------------------- |
| validate      | Function            | false               | Custom validator function. You can return custom error string from your validator
| transform     | Function            | false               | A custom function to overwrite the value
| default       | Function            | false               | A custom function to set the default value

**Usages:**

```typescript
const attribute = new MapType({
    validate: (v: Record<string, any> | undefined) => (!v.type ? 'type must exist' : undefined),
    transform: (v: Record<string, any> | undefined) => {
        Object.keys(v).map(k => v[k].toUpperCase())
        return v
    }),
    default: () => {},
})
attribute.value = { type: 'x', a: 'a', b: 'b' }
```

### NumberSet

This type is for defining attributes to store a set of numbers.

**Options:**

```typescript
type NumberSetBaseType = Omit<Attribute, 'type'>

export interface NumberSetOptions extends NumberSetBaseType {
    min?: number
    max?: number
    size?: number
    validate?: (v: Set<number> | undefined) => string | undefined
    transform?: (v: Set<number> | undefined) => Set<number> | undefined
    default?: () => Set<number>
}
```

| Parameter     | Type                | Required            | Description         |
| ------------- | ------------------- | ------------------- | ------------------- |
| min           | number              | false               | Checks length of the value is not less than the provided number
| max           | number              | false               | Checks length of the value is not greater than the provided number
| size          | number              | false               | Checks length of the value is equal to the provided number
| validate      | Function            | false               | Custom validator function. You can return custom error string from your validator
| transform     | Function            | false               | A custom function to overwrite the value
| default       | Function            | false               | A custom function to set the default value

**Usages:**

```typescript
const attribute = new NumberSetType({
    min: 1,
    max: 5,
    size: 3,
    validate: (v: Set<number> | undefined) => (v.size % 2 ? 'number of items in the value must be even' : undefined),
    transform: (v: Set<number> | undefined) => new Set(Array.from(v).map(k => k * 2)),
    default: () => new Set<number>(),
})
attribute.value = new Set([1, 2])
attribute.plain() // [2, 4]
```

### StringSet

This type is for defining attributes to store a set of strings.

**Options:**

```typescript
type StringSetBaseType = Omit<Attribute, 'type'>

export interface StringSetOptions extends StringSetBaseType {
    min?: number
    max?: number
    size?: number
    validate?: (v: Set<string> | undefined) => string | undefined
    transform?: (v: Set<string> | undefined) => Set<string> | undefined
    default?: () => Set<string>
}
```

| Parameter     | Type                | Required            | Description         |
| ------------- | ------------------- | ------------------- | ------------------- |
| min           | number              | false               | Checks length of the value is not less than the provided number
| max           | number              | false               | Checks length of the value is not greater than the provided number
| size          | number              | false               | Checks length of the value is equal to the provided number
| validate      | Function            | false               | Custom validator function. You can return custom error string from your validator
| transform     | Function            | false               | A custom function to overwrite the value
| default       | Function            | false               | A custom function to set the default value

**Usages:**

```typescript
const attribute = new StringSetType({
    min: 1,
    max: 5,
    size: 3,
    validate: (v: Set<string> | undefined) => (v.size % 2 ? 'number of items in the value must be even' : undefined),
    transform: (v: Set<string> | undefined) => new Set(Array.from(v).map(k => k.toUpperCase())),
    default: () => new Set<string>(),
})
attribute.value = new Set(['a', 'b'])
attribute.plain() // ['A', 'B']
```

### Soft Delete

This type is for marking attributes as deleted.
It supports only common options except partitionKey, sortKey or ignore.
It's default value is **false** and you can assign only a **boolean** value.

**Options:**

```typescript
type BooleanBaseType = Omit<Attribute, 'type'>

interface BooleanOptions extends BooleanBaseType {}
```

**Usages:**

```typescript
const attribute = new SoftDelete({})
attribute.value = true
```
