import { DynamicModule, Global, Inject, Logger, Module, OnApplicationShutdown, Provider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Connection } from 'mongoose';
import * as mongoose from 'mongoose';
import { defer, delay, from, lastValueFrom, retryWhen, scan } from 'rxjs';

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
        const { connectionName, retryAttempts, retryDelay, ...mongooseConnectOptions } = options;

        const connectionToken = getConnectionToken(connectionName);
        const connectionProvider: Provider = {
            provide: connectionToken,
            async useFactory() {
                const logger = new Logger('KindagooseModule');

                return await lastValueFrom(
                    from(defer(() => mongoose.createConnection(uri, mongooseConnectOptions).asPromise())).pipe(
                        retryWhen(e =>
                            e.pipe(
                                scan((errorCount, error) => {
                                    logger.error(
                                        `Unable to connect to the database. Retrying (${errorCount + 1})...`,
                                        '',
                                    );
                                    if (errorCount + 1 >= (retryAttempts || 3)) {
                                        throw error;
                                    }
                                    return errorCount + 1;
                                }, 0),
                                delay(retryDelay || 3000),
                            ),
                        ),
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

    async onApplicationShutdown() {
        const connection = this.moduleRef.get<Connection>(this.connectionName);
        if (connection) await connection.close();
    }
}
