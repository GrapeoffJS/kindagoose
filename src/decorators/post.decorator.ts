import { SetMetadata } from '@nestjs/common';

import { POST_METADATA_KEY } from '../constants/kindagoose.constants';
import { PostEvents } from '../constants/post-events';

/**
 * Method, that marked with this decorator will be called after execution of passed events.
 * @param {[PostEvents]} eventNames - Events that will be handled by this method.
 * @constructor
 */
export const Post = (...eventNames: PostEvents[]) => SetMetadata(POST_METADATA_KEY, [...new Set(eventNames)]);
