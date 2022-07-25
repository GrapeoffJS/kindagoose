import { ConnectOptions } from 'mongoose';

/***
 * @property {number} retryAttempts - How many times Kindagoose should try to connect to database if it catches an error.
 * @property {number} retryDelay - How much time Kindagoose should wait before next attempt.
 * @property {string} connectionName - Name for mongoose connection. If undefined, default connection name will be used.
 */
export interface KindagooseModuleOptions extends ConnectOptions {
    retryAttempts?: number;
    retryDelay?: number;
    connectionName?: string;
}
