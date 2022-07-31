import { Inject } from '@nestjs/common';

import { AnyClass } from '../interfaces/any-class.interface';
import { getModelToken } from '../utils/get-model-token';

/**
 * Gives access to registered model.
 * @param {AnyClass} schema - Typegoose schema.
 * @param connectionName - Name of mongoose connection.
 * @constructor
 */
export const InjectModel = (schema: AnyClass, connectionName?: string) =>
    Inject(getModelToken(schema.name, connectionName));
