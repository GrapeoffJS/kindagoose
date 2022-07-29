import { DynamicModule, Global, Inject, Module, OnApplicationShutdown, Provider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import mongoose, { Connection } from 'mongoose';

import { KINDAGOOSE_CONNECTION_NAME } from '../constants/kindagoose.constants';
import { KindagooseModuleOptions } from '../interfaces/kindagoose-module-options.interface';
import { getConnectionToken } from '../utils/get-connection-token';

@Global()
@Module({})
export class KindagooseCoreModule implements OnApplicationShutdown {
    constructor(
        @Inject(KINDAGOOSE_CONNECTION_NAME) private readonly connectionName: string,
        private readonly moduleRef: ModuleRef,
    ) {}

    static forRoot(uri: string, options: KindagooseModuleOptions): DynamicModule {
        const { connectionName, ...mongooseConnectOptions } = options;

        const connectionToken = getConnectionToken(connectionName);
        const connectionProvider: Provider = {
            provide: connectionToken,
            async useFactory() {
                return await mongoose.createConnection(uri, mongooseConnectOptions).asPromise();
            },
        };

        return {
            module: KindagooseCoreModule,
            imports: [],
            providers: [connectionProvider, { provide: KINDAGOOSE_CONNECTION_NAME, useValue: connectionToken }],
            exports: [connectionProvider],
        };
    }

    async onApplicationShutdown() {
        const connection = this.moduleRef.get<Connection>(this.connectionName);
        if (connection) await connection.close();
    }
}
