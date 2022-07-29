import { SetMetadata } from '@nestjs/common';

import { PostEvents } from '../constants/post-events';

export const Post = (...eventName: PostEvents[]) => SetMetadata('post', eventName);
