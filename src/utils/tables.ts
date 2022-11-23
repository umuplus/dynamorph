import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'

export enum IndexType {
    GSI = 'g',
    LSI = 'l',
}

export interface Index {
    type: IndexType
    partitionKey: string
    sortKey?: string
}

export interface Table {
    name: string
    partitionKey: string
    sortKey?: string
    indexes?: Record<string, Index>
    client?: DynamoDBDocumentClient
}
