import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { addModelToTypegoose, buildSchema, getName } from '@typegoose/typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { Connection } from 'mongoose';

import { EVENT_TRACKER_FOR_KEY, POST_METADATA_KEY, PRE_METADATA_KEY } from '../constants/kindagoose.constants';
import { PostEvents } from '../constants/post-events';
import { PreEvents } from '../constants/pre-events';
import { AnyClass } from '../interfaces/any-class.interface';

export const discriminatorFactory = (discriminator: AnyClass) => {
    return (
        connection: Connection,
        model: ModelType<any>,
        discoveryService: DiscoveryService,
        reflector: Reflector,
        metadataScanner: MetadataScanner,
    ) => {
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

            metadataScanner.scanFromPrototype(instance, Object.getPrototypeOf(instance), propertyName => {
                const propertyPreMetadata: PreEvents[] = reflector.get(PRE_METADATA_KEY, instance[propertyName]) || [];
                const propertyPostMetadata: PostEvents[] =
                    reflector.get(POST_METADATA_KEY, instance[propertyName]) || [];

                for (const preEventName of propertyPreMetadata) {
                    mongooseDiscriminatorSchema.pre(preEventName, instance[propertyName].bind(instance));
                }

                for (const postEventName of propertyPostMetadata) {
                    mongooseDiscriminatorSchema.post(postEventName, instance[propertyName].bind(instance));
                }
            });
        }

        return addModelToTypegoose(
            model.discriminator(getName(discriminator), mongooseDiscriminatorSchema),
            discriminator,
        );
    };
};
