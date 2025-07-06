import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand, GetObjectCommand, GetObjectOutput, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { validateJwt } from '../../../../utils/supabase-utils';

const ddbClient = new DynamoDB({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({});

// Function to get ALLOWED_ORIGIN with a default value
const getAllowedOrigin = (): string => {
    return process.env.ALLOWED_ORIGIN || '*'; // Default to '*' if undefined
};

async function generateDocumentation(profile: any): Promise<string> {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Smartman User Documentation</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        p { line-height: 1.6; }
      </style>
    </head>
    <body>
      <h1>User Documentation</h1>
      <p><strong>Name:</strong> ${profile.name || 'N/A'}</p>
      <p><strong>Preferences:</strong> ${JSON.stringify(profile.preferences || {})}</p>
    </body>
    </html>
  `;
    return htmlContent;
}

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
                PK: `USER#${user.userId}`,
                SK: 'PROFILE',
            },
        });
        const { Item: profile } = await ddbDocClient.send(command);
        if (!profile) throw new Error('User profile not found');

        const htmlContent = await generateDocumentation(profile);
        const key = `docs/${user.userId}/${Date.now()}.html`;
        const putCommand = new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: key,
            Body: htmlContent,
            ContentType: 'text/html',
        });
        await s3Client.send(putCommand);

        const getCommand = new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: key,
        });
        const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 }); // 1-hour expiration

        return {
            statusCode: 200,
            body: JSON.stringify({ url }),
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
            body: JSON.stringify({ error: error.message || 'Failed to generate documentation' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': getAllowedOrigin(),
            },
        };
    }
};
