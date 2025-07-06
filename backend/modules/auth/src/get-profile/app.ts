import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { validateJwt } from '../../../../utils/supabase-utils';

const ddbClient = new DynamoDB({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Function to get ALLOWED_ORIGIN with a default value
const getAllowedOrigin = (): string => {
    return process.env.ALLOWED_ORIGIN || '*'; // Default to '*' if undefined
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Handler started, received event:', JSON.stringify(event, null, 2));
    try {
        const authHeader = event.headers.Authorization || '';
        console.log('Extracted Authorization header:', authHeader);
        const token = authHeader.replace('Bearer ', '');
        console.log('Extracted token:', token.substring(0, 20) + '...');
        const user = await validateJwt(token);
        console.log('Validated user:', user);

        const command = new GetCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                PK: `USER#${user.userId}`, // Ensure this matches your DynamoDB schema
                SK: 'PROFILE', // Ensure this matches your DynamoDB schema
            },
        });
        console.log('Executing DynamoDB GetCommand:', JSON.stringify(command));
        const { Item: profile } = await ddbDocClient.send(command);
        console.log('DynamoDB response:', { profile });

        return {
            statusCode: 200,
            body: JSON.stringify({ profile: profile || null }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': getAllowedOrigin(),
            },
        };
    } catch (error: any) {
        console.error('Error in handler:', {
            message: error.message,
            stack: error.stack,
        });
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Failed to retrieve profile' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': getAllowedOrigin(),
            },
        };
    }
};
