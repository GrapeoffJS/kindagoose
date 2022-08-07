import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { AnyClass } from '../interfaces/any-class.interface';
import { KindagooseModuleAsyncOptions } from '../interfaces/kindagoose-module-async-options';
import { KindagooseModuleOptions } from '../interfaces/kindagoose-module-options.interface';
import { SchemaRegistrationOptions } from '../interfaces/schema-registration-options.interface';
import { convertToSchemaRegistrationOptions } from '../utils/convert-to-schema-registration-options';
import { createModelProviders } from '../utils/create-model-providers';
import { KindagooseCoreModule } from './kindagoose-core.module';

@Module({})
export class KindagooseModule {
    /***
     * Creates a global database connection.
     * @param {string} uri - MongoDB Connection URI.
     * @param {KindagooseModuleOptions} options - Configuration for KindagooseModule and mongoose.
     */
    static forRoot(uri: string, options: KindagooseModuleOptions = {}): DynamicModule {
        return {
            module: KindagooseModule,
            imports: [KindagooseCoreModule.forRoot(uri, options)],
        };
    }

    /**
     * Creates a global database connection with Nest's dependency injection.
     * @param {KindagooseModuleAsyncOptions} options - Configuration for KindagooseModule and mongoose.
     */
    static forRootAsync(options: KindagooseModuleAsyncOptions) {
        return {
            module: KindagooseModule,
            imports: [KindagooseCoreModule.forRootAsync(options)],
        };
    }

    /***
     * Used for registration your models within a module.
     * @param {(AnyClass | SchemaRegistrationOptions)[]} schemas - Array of Typegoose classes or schema registration options.
     * @param {string} connectionName - Mongoose connection name.
     */
    static forFeature(schemas: (AnyClass | SchemaRegistrationOptions)[], connectionName?: string): DynamicModule {
        const schemaRegistrationOptions = convertToSchemaRegistrationOptions(schemas);

        const modelProviders = createModelProviders(schemaRegistrationOptions, connectionName);

        return {
            module: KindagooseModule,
            imports: [DiscoveryModule],
            providers: modelProviders,
            exports: modelProviders,
        };
    }
}
