import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { addModelToTypegoose, buildSchema, getName } from '@typegoose/typegoose';
import { Connection } from 'mongoose';

import { EVENT_TRACKER_FOR_KEY, POST_METADATA_KEY, PRE_METADATA_KEY } from '../constants/kindagoose.constants';
import { PostEvents } from '../constants/post-events';
import { PreEvents } from '../constants/pre-events';
import { AnyClass } from '../interfaces/any-class.interface';

export const modelFactory = (schema: AnyClass) => {
    return (
        connection: Connection,
        discoveryService: DiscoveryService,
        reflector: Reflector,
        metadataScanner: MetadataScanner,
    ) => {
        const providers = discoveryService.getProviders().filter(provider => provider.instance);
        let tracker: InstanceWrapper | null = null;

        for (const provider of providers) {
            const trackerMetadata = reflector.get(EVENT_TRACKER_FOR_KEY, provider.instance.constructor);

            if (trackerMetadata === schema.name) {
                tracker = provider;
                break;
            }
        }

        const mongooseSchema = buildSchema(schema);

        if (tracker) {
            const { instance } = tracker;

            metadataScanner.scanFromPrototype(instance, Object.getPrototypeOf(instance), propertyName => {
                const propertyPreMetadata: PreEvents[] = reflector.get(PRE_METADATA_KEY, instance[propertyName]) || [];
                const propertyPostMetadata: PostEvents[] =
                    reflector.get(POST_METADATA_KEY, instance[propertyName]) || [];

                for (const preEventName of propertyPreMetadata) {
                    mongooseSchema.pre(preEventName, instance[propertyName].bind(instance));
                }

                for (const postEventName of propertyPostMetadata) {
                    mongooseSchema.post(postEventName, instance[propertyName].bind(instance));
                }
            });
        }

        return addModelToTypegoose(connection.model(getName(schema), mongooseSchema), schema);
    };
};
