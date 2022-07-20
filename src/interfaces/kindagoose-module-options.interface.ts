import { ConnectOptions } from 'mongoose';

export interface KindagooseModuleOptions extends ConnectOptions {
    retryAttempts?: number;
    retryDelay?: number;
    connectionName?: string;
}
