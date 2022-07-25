import { Provider } from '@nestjs/common';
import { getDiscriminatorModelForClass, getModelForClass } from '@typegoose/typegoose';

import { ModelRegistrationOptions } from '../interfaces/model-registration-options.interface';
import { getModelToken } from './get-model-token';

export const createModelProviders = (options: ModelRegistrationOptions[], connectionName?: string): Provider[] => {
    const providers: Provider[] = [];

    for (const option of options) {
        const model = getModelForClass(option.schema);

        providers.push({
            provide: getModelToken(option.schema.name, connectionName),
            useValue: model,
        });

        for (const discriminator of option.discriminators) {
            providers.push({
                provide: getModelToken(discriminator.name, connectionName),
                useValue: getDiscriminatorModelForClass(model, discriminator),
            });
        }
    }

    return providers;
};
