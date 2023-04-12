import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { addModelToTypegoose, buildSchema, getName } from '@typegoose/typegoose';
import { Connection } from 'mongoose';

import { EVENT_TRACKER_FOR_KEY, POST_METADATA_KEY, PRE_METADATA_KEY } from '../constants/kindagoose.constants';
import { AnyClass } from '../interfaces/any-class.interface';
import { getModelToken } from './get-model-token';

export const modelFactory = (schema: AnyClass, connectionName?: string) => {
    return (
        connection: Connection,
        discoveryService: DiscoveryService,
        reflector: Reflector,
        metadataScanner: MetadataScanner,
    ) => {
        const existingModel = discoveryService
            .getProviders()
            .find(provider => provider.token === getModelToken(schema.name, connectionName))?.instance;

        if (existingModel) {
            return existingModel;
        }

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

            const methodNames = metadataScanner.getAllMethodNames(Object.getPrototypeOf(instance));

            for (const methodName of methodNames) {
                const propertyPreMetadata = reflector.get(PRE_METADATA_KEY, instance[methodName]) || [];
                const propertyPostMetadata = reflector.get(POST_METADATA_KEY, instance[methodName]) || [];

                for (const preEventName of propertyPreMetadata) {
                    mongooseSchema.pre(preEventName, instance[methodName].bind(instance));
                }

                for (const postEventName of propertyPostMetadata) {
                    mongooseSchema.post(postEventName, instance[methodName].bind(instance));
                }
            }
        }

        return addModelToTypegoose(connection.model(getName(schema), mongooseSchema), schema);
    };
};
