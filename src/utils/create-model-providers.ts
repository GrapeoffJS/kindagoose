import { Provider } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

import { SchemaRegistrationOptions } from '../interfaces/schema-registration-options.interface';
import { discriminatorFactory } from './discriminator-factory';
import { getConnectionToken } from './get-connection-token';
import { getModelToken } from './get-model-token';
import { modelFactory } from './model-factory';

export const createModelProviders = (schemas: SchemaRegistrationOptions[], connectionName?: string): Provider[] => {
    const providers: Provider[] = [];

    for (const schema of schemas) {
        const modelToken = getModelToken(schema.schema.name, connectionName);

        providers.push({
            provide: modelToken,
            inject: [getConnectionToken(connectionName), DiscoveryService, Reflector, MetadataScanner],
            useFactory: modelFactory(schema.schema),
        });

        if (schema.discriminators) {
            for (const discriminator of schema.discriminators) {
                providers.push({
                    provide: getModelToken(discriminator.name, connectionName),
                    inject: [
                        getConnectionToken(connectionName),
                        modelToken,
                        DiscoveryService,
                        Reflector,
                        MetadataScanner,
                    ],
                    useFactory: discriminatorFactory(discriminator),
                });
            }
        }
    }

    return providers;
};
