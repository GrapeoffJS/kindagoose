import { SetMetadata } from '@nestjs/common';

import { PRE_METADATA_KEY } from '../constants/kindagoose.constants';
import { PreEvents } from '../constants/pre-events';

/**
 * Method, that marked with this decorator will be called before execution of passed events.
 * @param {[PreEvents]} eventNames - Events that will be handled by this method.
 * @constructor
 */
export const Pre = (...eventNames: PreEvents[]) => SetMetadata(PRE_METADATA_KEY, [...new Set(eventNames)]);
