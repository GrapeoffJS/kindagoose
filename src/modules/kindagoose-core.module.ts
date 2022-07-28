import { DynamicModule, Global, Inject, Module, OnApplicationShutdown, Provider } from '@nestjs/common';
import { DiscoveryModule, ModuleRef } from '@nestjs/core';
import mongoose, { Connection } from 'mongoose';

import { KINDAGOOSE_CONNECTION_NAME } from '../constants/kindagoose.constants';
import { KindagooseModuleOptions } from '../interfaces/kindagoose-module-options.interface';
import { MetadataAccessor } from '../providers/metadata-accessor.provider';
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
            imports: [DiscoveryModule],
            module: KindagooseCoreModule,
            providers: [
                MetadataAccessor,
                connectionProvider,
                { provide: KINDAGOOSE_CONNECTION_NAME, useValue: connectionToken },
            ],
            exports: [MetadataAccessor, connectionProvider],
        };
    }

    async onApplicationShutdown() {
        const connection = this.moduleRef.get<Connection>(this.connectionName);
        if (connection) await connection.close();
    }
}
