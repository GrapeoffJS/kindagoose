import { Provider } from '@nestjs/common';
import { getDiscriminatorModelForClass, getModelForClass } from '@typegoose/typegoose';
import { Connection, Model } from 'mongoose';

import { ModelRegistrationOptions } from '../interfaces/model-registration-options.interface';
import { getConnectionToken } from './get-connection-token';
import { getModelToken } from './get-model-token';

export const createModelProviders = (options: ModelRegistrationOptions[], connectionName?: string): Provider[] => {
    const providers: Provider[] = [];

    for (const option of options) {
        providers.push({
            provide: getModelToken(option.schema.name, connectionName),
            inject: [getConnectionToken(connectionName)],
            useFactory(connection: Connection) {
                return getModelForClass(option.schema, { existingConnection: connection });
            },
        });

        if (option.discriminators) {
            for (const discriminator of option.discriminators) {
                providers.push({
                    provide: getModelToken(discriminator.name, connectionName),
                    inject: [getModelToken(option.schema.name)],
                    useFactory: (model: Model<any>) => {
                        return getDiscriminatorModelForClass(model, discriminator);
                    },
                });
            }
        }
    }

    return providers;
};
