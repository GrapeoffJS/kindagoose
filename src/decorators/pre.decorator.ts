import { SetMetadata } from '@nestjs/common';

import { Hook } from '../constants/hook';
import { PRE_METADATA_KEY } from '../constants/kindagoose.constants';

/**
 * Method, that marked with this decorator will be called before the execution of passed events.
 * @param {[Hook]} hooks - Events that will be handled by this method.
 * @constructor
 */
export const Pre = (...hooks: Hook[]) => SetMetadata(PRE_METADATA_KEY, [...new Set(hooks)]);
