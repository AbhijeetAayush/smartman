import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    GetCommand,
    GetCommandOutput,
    PutCommand,
    PutCommandOutput,
    QueryCommand,
    QueryCommandOutput,
    DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { Item } from '../types/model';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const saveItem = async <T extends Item>(tableName: string, item: T): Promise<PutCommandOutput> => {
    const command = new PutCommand({
        TableName: tableName,
        Item: item,
    });
    console.log('Executing DynamoDB PutCommand:', JSON.stringify(command));
    const result = await docClient.send(command);
    console.log('Item saved successfully:', result.$metadata);
    return result;
};

export const getItem = async (tableName: string, key: { PK: string; SK: string }): Promise<GetCommandOutput> => {
    try {
        const command = new GetCommand({ TableName: tableName, Key: key });
        console.log('Executing DynamoDB GetCommand:', JSON.stringify(command));
        const result = await docClient.send(command);
        console.log('DynamoDB response:', { Item: result.Item });
        return result;
    } catch (error) {
        console.error('Error fetching item from DynamoDB:', error);
        throw error;
    }
};

export const getItems = async (
    tableName: string,
    keyCondition: { PK: string; SKPrefix?: string },
    filterExpression?: string,
): Promise<QueryCommandOutput> => {
    console.log(
        'Getting items with keyCondition:',
        JSON.stringify(keyCondition),
        'filterExpression:',
        filterExpression,
    );
    const expressionParts: string[] = [];
    const expressionNames: { [key: string]: string } = {};
    const expressionValues: { [key: string]: any } = {};

    // Build KeyConditionExpression
    expressionParts.push('#pk = :pk');
    expressionNames['#pk'] = 'PK';
    expressionValues[':pk'] = keyCondition.PK;
    if (keyCondition.SKPrefix) {
        expressionParts.push('begins_with(#sk, :skPrefix)');
        expressionNames['#sk'] = 'SK';
        expressionValues[':skPrefix'] = keyCondition.SKPrefix;
    }

    // Handle FilterExpression for non-key attributes
    let parsedFilterExpression: string | undefined;
    if (filterExpression) {
        const match = filterExpression.match(/(\w+)\s+(=|>|<|>=|<=|<>)\s+(.+)/); // Basic comparison operators
        if (match) {
            const attrName = match[1];
            const operator = match[2];
            const value = match[3];
            if (attrName !== 'PK' && attrName !== 'SK') {
                // Ensure non-key attributes
                parsedFilterExpression = `#${attrName} ${operator} :${attrName}Value`;
                expressionNames[`#${attrName}`] = attrName;
                expressionValues[`:${attrName}Value`] = value;
            } else {
                throw new Error('Filter Expression cannot contain primary key attributes');
            }
        } else {
            throw new Error('Invalid filter expression syntax');
        }
    }

    const command = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: expressionParts.join(' AND '),
        ExpressionAttributeNames: expressionNames,
        ExpressionAttributeValues: expressionValues,
        FilterExpression: parsedFilterExpression,
    });
    console.log('Executing DynamoDB QueryCommand:', JSON.stringify(command));
    try {
        const result = await docClient.send(command);
        console.log('DynamoDB response:', { Items: result.Items });
        return result;
    } catch (error) {
        console.error('Error querying items from DynamoDB:', error);
        throw error;
    }
};

export const deleteItem = async (tableName: string, key: { PK: string; SK: string }): Promise<void> => {
    try {
        const command = new DeleteCommand({ TableName: tableName, Key: key });
        console.log('Executing DynamoDB DeleteCommand:', JSON.stringify(command));
        const result = await docClient.send(command);
        console.log('Item deleted successfully:', result.$metadata);
    } catch (error) {
        console.error('Error deleting item from DynamoDB:', error);
        throw error;
    }
};
