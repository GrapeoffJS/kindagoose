import { ModuleMetadata } from '@nestjs/common';

import { KindagooseModuleOptions } from './kindagoose-module-options.interface';

/**
 * @property {string} connectionName - Name for mongoose connection. If undefined, default connection name will be used.
 * @property {[any]} inject - What providers to inject in options factory.
 * @property useFactory - Options factory.
 */
export interface KindagooseModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    connectionName?: string;
    inject: any[];
    useFactory: (...args: any[]) => Omit<KindagooseModuleOptions, 'connectionName'>;
}
