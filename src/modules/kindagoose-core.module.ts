import { DynamicModule, Global, Inject, Module, OnApplicationShutdown, Provider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import mongoose, { Connection } from 'mongoose';
import { defer, lastValueFrom } from 'rxjs';

import { KINDAGOOSE_CONNECTION_NAME, KINDAGOOSE_MODULE_OPTIONS } from '../constants/kindagoose.constants';
import { KindagooseModuleAsyncOptions } from '../interfaces/kindagoose-module-async-options';
import { KindagooseModuleOptions } from '../interfaces/kindagoose-module-options.interface';
import { getConnectionToken } from '../utils/get-connection-token';
import { handleRetry } from '../utils/handle-retry';

@Global()
@Module({})
export class KindagooseCoreModule implements OnApplicationShutdown {
    constructor(
        @Inject(KINDAGOOSE_CONNECTION_NAME) private readonly connectionName: string,
        private readonly moduleRef: ModuleRef,
    ) {}

    static forRoot(uri: string, options: KindagooseModuleOptions): DynamicModule {
        const { retryAttempts, retryDelay, connectionName, ...mongooseConnectOptions } = options;
        const connectionToken = getConnectionToken(connectionName);

        const connectionProvider: Provider = {
            provide: connectionToken,
            async useFactory() {
                return await lastValueFrom(
                    defer(async () => await mongoose.createConnection(uri, mongooseConnectOptions).asPromise()).pipe(
                        handleRetry(retryAttempts, retryDelay),
                    ),
                );
            },
        };

        return {
            module: KindagooseCoreModule,
            providers: [connectionProvider, { provide: KINDAGOOSE_CONNECTION_NAME, useValue: connectionToken }],
            exports: [connectionProvider],
        };
    }

    static forRootAsync(options: KindagooseModuleAsyncOptions): DynamicModule {
        const connectionToken = getConnectionToken(options.connectionName);

        const optionsProvider: Provider = {
            provide: KINDAGOOSE_MODULE_OPTIONS,
            inject: options.inject,
            useFactory: options.useFactory,
        };

        const connectionProvider: Provider = {
            provide: connectionToken,
            inject: [KINDAGOOSE_MODULE_OPTIONS],
            async useFactory(connectOptions: Omit<KindagooseModuleOptions, 'connectionName'> & { uri: string }) {
                const { uri, retryDelay, retryAttempts, ...mongooseConnectOptions } = connectOptions;

                return await lastValueFrom(
                    defer(async () => await mongoose.createConnection(uri, mongooseConnectOptions).asPromise()).pipe(
                        handleRetry(retryAttempts, retryDelay),
                    ),
                );
            },
        };

        return {
            module: KindagooseCoreModule,
            imports: options.imports,
            providers: [
                optionsProvider,
                connectionProvider,
                { provide: KINDAGOOSE_CONNECTION_NAME, useValue: connectionToken },
            ],
            exports: [
                optionsProvider,
                connectionProvider,
                { provide: KINDAGOOSE_CONNECTION_NAME, useValue: connectionToken },
            ],
        };
    }

    async onApplicationShutdown() {
        const connection = this.moduleRef.get<Connection>(this.connectionName);
        if (connection) await connection.close();
    }
}
