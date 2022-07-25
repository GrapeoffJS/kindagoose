import { TypegooseSchema } from './typegoose-schema.interface';

export interface ModelRegistrationOptions {
    schema: TypegooseSchema;
    discriminators: TypegooseSchema[];
}
