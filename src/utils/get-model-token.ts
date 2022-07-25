import { getConnectionToken } from './get-connection-token';

export const getModelToken = (typegooseClassName: string, connectionName?: string) => {
    if (connectionName === undefined) {
        return `${typegooseClassName}Model`;
    }

    return `${getConnectionToken(connectionName)}/${typegooseClassName}Model`;
};
