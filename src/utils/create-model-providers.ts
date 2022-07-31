import { Provider } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';

import { ModelRegistrationOptions } from '../interfaces/model-registration-options.interface';
import { discriminatorFactory } from './discriminator-factory';
import { getConnectionToken } from './get-connection-token';
import { getModelToken } from './get-model-token';
import { modelFactory } from './model-factory';

export const createModelProviders = (options: ModelRegistrationOptions[], connectionName?: string): Provider[] => {
    const providers: Provider[] = [];

    for (const option of options) {
        const modelToken = getModelToken(option.schema.name, connectionName);

        providers.push({
            provide: modelToken,
            inject: [getConnectionToken(connectionName), DiscoveryService, Reflector, MetadataScanner],
            useFactory: modelFactory(option.schema),
        });

        if (option.discriminators) {
            for (const discriminator of option.discriminators) {
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
