import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { addModelToTypegoose, buildSchema, getName } from '@typegoose/typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { Connection } from 'mongoose';

import { EVENT_TRACKER_FOR_KEY, POST_METADATA_KEY, PRE_METADATA_KEY } from '../constants/kindagoose.constants';
import { AnyClass } from '../interfaces/any-class.interface';
import { getModelToken } from './get-model-token';

export const discriminatorFactory = (discriminator: AnyClass, connectionName?: string) => {
    return (
        connection: Connection,
        model: ModelType<any>,
        discoveryService: DiscoveryService,
        reflector: Reflector,
        metadataScanner: MetadataScanner,
    ) => {
        const existingDiscriminator = discoveryService
            .getProviders()
            .find(provider => provider.token === getModelToken(discriminator.name, connectionName));

        if (existingDiscriminator) {
            return existingDiscriminator;
        }

        const providers = discoveryService.getProviders().filter(provider => provider.instance);
        let tracker: InstanceWrapper | null = null;

        for (const provider of providers) {
            const trackerMetadata = reflector.get(EVENT_TRACKER_FOR_KEY, provider.instance.constructor);

            if (trackerMetadata === discriminator.name) {
                tracker = provider;
                break;
            }
        }

        const mongooseDiscriminatorSchema = buildSchema(discriminator);

        if (tracker) {
            const { instance } = tracker;

            const methodNames = metadataScanner.getAllMethodNames(Object.getPrototypeOf(instance));

            for (const methodName of methodNames) {
                const propertyPreMetadata = reflector.get(PRE_METADATA_KEY, instance[methodName]) || [];
                const propertyPostMetadata = reflector.get(POST_METADATA_KEY, instance[methodName]) || [];

                for (const preEventName of propertyPreMetadata) {
                    mongooseDiscriminatorSchema.pre(preEventName, instance[methodName].bind(instance));
                }

                for (const postEventName of propertyPostMetadata) {
                    mongooseDiscriminatorSchema.post(postEventName, instance[methodName].bind(instance));
                }
            }
        }

        return addModelToTypegoose(
            model.discriminator(getName(discriminator), mongooseDiscriminatorSchema),
            discriminator,
        );
    };
};
