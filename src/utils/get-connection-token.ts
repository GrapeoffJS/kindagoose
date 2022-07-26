import { DEFAULT_CONNECTION_NAME } from '../constants/kindagoose.constants';

/**
 * Get connection injection token
 * @param {string} connectionName
 */
export const getConnectionToken = (connectionName?: string) => {
    return connectionName && connectionName !== DEFAULT_CONNECTION_NAME
        ? `${connectionName}Connection`
        : DEFAULT_CONNECTION_NAME;
};
