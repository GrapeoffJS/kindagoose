import { Inject } from '@nestjs/common';

import { getConnectionToken } from '../utils/get-connection-token';

/**
 * Gives access directly to mongoose connection.
 * @param {string} connectionName - name of connection.
 * @constructor
 */
export const InjectConnection = (connectionName?: string) => Inject(getConnectionToken(connectionName));
