import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { validateJwt } from '../../../../utils/supabase-utils';
import { saveCollection } from '../../../../utils/collections-db-handler';

const getAllowedOrigin = (): string => {
    return process.env.ALLOWED_ORIGIN || '*';
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

        const body = JSON.parse(event.body || '{}');
        const { collectionName, items } = body;
        if (!collectionName || !items || !Array.isArray(items)) {
            throw new Error('Missing or invalid collectionName or items');
        }

        const collectionId = await saveCollection(user.userId, collectionName, items);
        console.log('Collection saved successfully with ID:', collectionId);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Collection saved', collectionId }),
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
            body: JSON.stringify({ error: error.message || 'Failed to save collection' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': getAllowedOrigin(),
            },
        };
    }
};
