import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { KindagooseModuleAsyncOptions } from '../interfaces/kindagoose-module-async-options';
import { KindagooseModuleOptions } from '../interfaces/kindagoose-module-options.interface';
import { SchemaRegistrationOptions } from '../interfaces/schema-registration-options.interface';
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
     * @param {SchemaRegistrationOptions[]} options - Model registration options.
     * @param {string} connectionName - Mongoose connection name.
     */
    static forFeature(options: SchemaRegistrationOptions[], connectionName?: string): DynamicModule {
        const modelProviders = createModelProviders(options, connectionName);

        return {
            module: KindagooseModule,
            imports: [DiscoveryModule],
            providers: modelProviders,
            exports: modelProviders,
        };
    }
}
