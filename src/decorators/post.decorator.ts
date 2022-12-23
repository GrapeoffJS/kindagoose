import { SetMetadata } from '@nestjs/common';

import { Hook } from '../constants/hook';
import { POST_METADATA_KEY } from '../constants/kindagoose.constants';

/**
 * Method, that marked with this decorator will be called after execution of passed events.
 * @param {[Hook]} hooks - Events that will be handled by this method.
 * @constructor
 */
export const Post = (...hooks: Hook[]) => SetMetadata(POST_METADATA_KEY, [...new Set(hooks)]);
