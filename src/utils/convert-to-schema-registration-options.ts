import { AnyClass } from '../interfaces/any-class.interface';
import { SchemaRegistrationOptions } from '../interfaces/schema-registration-options.interface';

export const convertToSchemaRegistrationOptions = (
    schemas: (AnyClass | SchemaRegistrationOptions)[],
): SchemaRegistrationOptions[] => {
    return schemas.map(schema => {
        return 'schema' in schema && schema.schema
            ? {
                  schema: schema.schema,
                  discriminators: schema.discriminators,
              }
            : {
                  schema: schema as AnyClass,
              };
    });
};
