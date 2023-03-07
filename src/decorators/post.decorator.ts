import { SetMetadata } from '@nestjs/common';

import { POST_METADATA_KEY } from '../constants/kindagoose.constants';
import { PostHook } from '../interfaces/post-hook';

/**
 * Method, that marked with this decorator will be called after execution of passed events.
 * @param {[PostHook]} hooks - Events that will be handled by this method.
 * @constructor
 */
export const Post = (...hooks: PostHook[]) => SetMetadata(POST_METADATA_KEY, [...new Set(hooks)]);
