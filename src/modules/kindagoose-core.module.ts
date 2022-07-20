import { DynamicModule, Global, Module, OnApplicationShutdown, Provider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import mongoose from 'mongoose';

import { KindagooseModuleOptions } from '../interfaces/kindagoose-module-options.interface';
import { getConnectionToken } from '../utils/get-connection-token';

@Global()
@Module({})
export class KindagooseCoreModule implements OnApplicationShutdown {
    constructor(private readonly moduleRef: ModuleRef) {}

    static forRoot(uri: string, options: KindagooseModuleOptions): DynamicModule {
        const { connectionName, ...mongooseConnectOptions } = options;

        const connectionProvider: Provider = {
            provide: getConnectionToken(connectionName),
            async useFactory() {
                return await mongoose.createConnection(uri, mongooseConnectOptions).asPromise();
            },
        };

        return {
            module: KindagooseCoreModule,
            providers: [connectionProvider],
            exports: [connectionProvider],
        };
    }

    onApplicationShutdown(signal?: string): any {}
}
