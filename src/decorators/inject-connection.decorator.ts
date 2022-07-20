import { Inject } from '@nestjs/common';

import { getConnectionToken } from '../utils/get-connection-token';

export const InjectConnection = (connectionName?: string) => Inject(getConnectionToken(connectionName));
