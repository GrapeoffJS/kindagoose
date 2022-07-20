import { DEFAULT_CONNECTION_NAME } from '../constants/kindagoose.constants';

export const getConnectionToken = (connectionName?: string) => {
    return connectionName && connectionName !== DEFAULT_CONNECTION_NAME
        ? `${connectionName}Connection`
        : DEFAULT_CONNECTION_NAME;
};
