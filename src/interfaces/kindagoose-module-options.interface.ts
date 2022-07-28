import { ConnectOptions } from 'mongoose';

/***
 * @property {string} connectionName - Name for mongoose connection. If undefined, default connection name will be used.
 */
export interface KindagooseModuleOptions extends ConnectOptions {
    connectionName?: string;
}
