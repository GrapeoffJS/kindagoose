import { Inject } from '@nestjs/common';

import { AnyClass } from '../interfaces/any-class.interface';
import { getModelToken } from '../utils/get-model-token';

export const InjectModel = (schema: AnyClass, connectionName?: string) =>
    Inject(getModelToken(schema.name, connectionName));
