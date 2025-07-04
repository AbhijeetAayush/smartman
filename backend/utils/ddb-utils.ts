import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
  PutCommand,
  PutCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { Item } from '../types/model';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const saveItem = async <T extends Item>(tableName: string, item: T): Promise<PutCommandOutput> => {
  return docClient.send(new PutCommand({ TableName: tableName, Item: item }));
};

export const getItem = async (tableName: string, key: { PK: string; SK: string }): Promise<GetCommandOutput> => {
  try {
    return await docClient.send(new GetCommand({ TableName: tableName, Key: key }));
  } catch (error) {
    console.error('Error fetching item from DynamoDB:', error);
    throw error;
  }
};