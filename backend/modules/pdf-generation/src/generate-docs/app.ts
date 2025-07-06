import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import PDFDocument from 'pdfkit';
import { validateJwt } from '../../../../utils/supabase-utils';
import { getUserProfile } from '../../../../utils/auth-db-handler';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const authHeader = event.headers.Authorization || '';
        const token = authHeader.replace('Bearer ', '');
        const user = await validateJwt(token);

        const profile = await getUserProfile(user.userId);
        if (!profile) throw new Error('User profile not found');

        const doc = new PDFDocument();
        let buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(buffers);
            return { statusCode: 200, body: pdfBuffer.toString('base64'), isBase64Encoded: true };
        });

        doc.fontSize(18).text('Smartman User Profile', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Name: ${profile.name || 'N/A'}`);
        doc.text(`Preferences: ${JSON.stringify(profile.preferences || {})}`);
        doc.end();

        return new Promise((resolve) =>
            resolve({ statusCode: 200, body: '', headers: { 'Content-Type': 'application/pdf' } }),
        );
    } catch (error: any) {
        return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Failed to generate PDF' }) };
    }
};
