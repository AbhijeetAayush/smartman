export const validateUpdateProfileRequest = async (request: {
    name?: string;
    preferences?: Record<string, any>;
}): Promise<void> => {
    if (!request.name && !request.preferences) {
        throw new Error('At least one field (name or preferences) is required');
    }
};

export const validateCreateCollectionRequest = async (request: {
    collectionName?: string;
    items?: string[];
}): Promise<void> => {
    if (!request.collectionName || !request.items || request.items.length === 0) {
        throw new Error('collectionName and items are required');
    }
};

export const validateExecuteRequest = async (request: { url?: string; method?: string; body?: any }): Promise<void> => {
    if (!request.url) {
        throw new Error('URL is required');
    }
};
