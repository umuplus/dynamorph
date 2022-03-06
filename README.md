# Dynamorph

It's a minimalist toolkit for aws dynamodb.

It's not an ORM.
The main purpose is to make single table design smooth and easy with validators and converters through built-in types.

## Development Status

It's still in development

## Supported Types

```typescript
interface CommonAttributes {
    fieldName?: string
    partitionKey?: boolean
    sortKey?: boolean
    ignore?: boolean
    required?: boolean
}
```

- **fieldName :**
If you set field name, its value will go to database instead of the actual property name.
By default, it's undefined.
Actual property name will be used to save to database.
- **partitionKey :**
This flag specifies if the attribute is a partition key.
By default, it's false.
- **sortKey :**
This flag specifies if the attribute is a sort key.
By default, it's false.
- **ignore :**
This flag specifies if the attribute should be saved to database.
By default, it's false.
- **required :**
This flag specifies if the attribute is required.
By default, it's optional.

> All types below extends common attributes.

### String

```typescript
interface StringType {
    type?: 'email' | 'uuid' | 'cuid' | 'url'
    format?: string
    min?: number
    max?: number
    length?: number
    regex?: RegExp
    transform?: (input: string) => string
}
```

- **type :**
This parameter specifies what kind of string the attribute holds.
By default, it's undefined.
- **format :**
This parameter enables template support for the attribute.
If you enable template support you must call applyFormat instead of setValue for proper assignment.
By default, it's disabled.
- **min, max, length :**
This parameter specifies how many letters should the value include (minimum, maximum or exactly)?
By default, it's undefined.
- **regex :**
This parameter enables regular expression support for the attribute.
By default, it's disabled.
- **transform :**
This parameter provides a function to transform the value.
By default, it's undefined.

### Number

```typescript
interface NumberType {
    min?: number
    max?: number
    transform?: (input: number) => number
}
```

- **min, max :**
This parameter specifies minimum and maximum value for the attribute
By default, it's undefined.
- **transform :**
This parameter provides a function to transform the value.
By default, it's undefined.

### Soft Delete

This is a special type to provide soft delete feature.
It doesn't require any parameter.

### Update Token

This is a special type to provide update token feature.
The purpose of the feature is to lock the record atomically against race conditions.
Only correct update token can unlock it.

```typescript
interface UpdateTokenType {
    length: number
}
```

- **length :**
This parameter specifies how many letters should the auto-generated token have?

### Timestamps

This is a special type to provide auto-managed timestamp feature.
The purpose of the feature is to set the attribute with correctly formatted date when a specific action occurred.

```typescript
interface TimestampType {
    type: 'ISO_STRING' | 'MILLISECONDS' | 'SECONDS'
    on: 'CREATE' | 'UPDATE' | 'DELETE'
}
```

- **type :**
This parameter specifies the date format.
- **on :**
This parameter specifies the action that triggers updating the value.
