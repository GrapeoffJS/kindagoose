import { getConnectionToken } from './get-connection-token';

/**
 * Get model injection token
 * @param {string} typegooseClassName - Name of Typegoose schema class
 * @param {string} connectionName
 */
export const getModelToken = (typegooseClassName: string, connectionName?: string) => {
    if (connectionName === undefined) {
        return `${typegooseClassName}Model`;
    }

    return `${getConnectionToken(connectionName)}/${typegooseClassName}Model`;
};
