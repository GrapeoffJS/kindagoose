import { SetMetadata } from '@nestjs/common';

import { PreEvents } from '../constants/pre-events';

export const Pre = (...eventName: PreEvents[]) => SetMetadata('pre', eventName);
