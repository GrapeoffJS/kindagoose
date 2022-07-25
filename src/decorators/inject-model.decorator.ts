import { Inject } from '@nestjs/common';

import { TypegooseSchema } from '../interfaces/typegoose-schema.interface';
import { getModelToken } from '../utils/get-model-token';

export const InjectModel = (schema: TypegooseSchema, connectionName?: string) =>
    Inject(getModelToken(schema.name, connectionName));
