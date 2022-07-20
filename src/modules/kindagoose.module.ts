import { DynamicModule, Module } from '@nestjs/common';

import { KindagooseModuleOptions } from '../interfaces/kindagoose-module-options.interface';
import { KindagooseCoreModule } from './kindagoose-core.module';

@Module({})
export class KindagooseModule {
    static forRoot(uri: string, options: KindagooseModuleOptions = {}): DynamicModule {
        return {
            module: KindagooseModule,
            imports: [KindagooseCoreModule.forRoot(uri, options)],
        };
    }
}
