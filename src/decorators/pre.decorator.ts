import { SetMetadata } from '@nestjs/common';

import { PRE_METADATA_KEY } from '../constants/kindagoose.constants';
import { PreHook } from '../interfaces/pre-hook';

/**
 * Method, that marked with this decorator will be called before the execution of passed events.
 * @param {[PreHook]} hooks - Events that will be handled by this method.
 * @constructor
 */
export const Pre = (...hooks: PreHook[]) => SetMetadata(PRE_METADATA_KEY, [...new Set(hooks)]);
