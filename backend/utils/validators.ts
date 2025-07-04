export const validateUpdateProfileRequest = async (request: {
    name?: string;
    preferences?: Record<string, any>;
}): Promise<void> => {
    if (!request.name && !request.preferences) {
        throw new Error('At least one field (name or preferences) is required');
    }
};
