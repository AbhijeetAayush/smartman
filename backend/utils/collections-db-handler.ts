import { saveItem, getItems, deleteItem } from './ddb-utils';
import { Collection } from '../types/model';
import { v4 as uuidv4 } from 'uuid'; // Import UUID v4

export const saveCollection = async (userId: string, name: string, items: string[]): Promise<string> => {
    const collectionId = uuidv4(); // Generate a UUID-based collection ID
    const item = {
        PK: `USER#${userId}`,
        SK: `COLLECTION#${collectionId}`,
        Type: 'COLLECTION',
        createdAt: new Date().toISOString(),
        data: { collectionName: name, items },
    };
    await saveItem(process.env.TABLE_NAME!, item);
    return collectionId; // Return the generated collectionId
};

export const listCollections = async (userId: string): Promise<Collection[]> => {
    console.log('Listing collections for userId:', userId);
    const result = await getItems(process.env.TABLE_NAME!, { PK: `USER#${userId}`, SKPrefix: 'COLLECTION#' });
    return result.Items ? result.Items.map((item) => item.data as Collection) : [];
};

export const deleteCollection = async (userId: string, collectionId: string): Promise<void> => {
    console.log('Deleting collection for userId:', userId, 'collectionId:', collectionId);
    const key = { PK: `USER#${userId}`, SK: `COLLECTION#${collectionId}` };
    await deleteItem(process.env.TABLE_NAME!, key);
};
