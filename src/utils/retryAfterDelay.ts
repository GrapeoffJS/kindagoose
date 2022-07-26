import { Logger } from '@nestjs/common';
import { Observable, retry } from 'rxjs';

export const retryAfterDelay = <T>(
    retryAttempts = 3,
    retryDelay = 3000,
): ((source: Observable<any>) => Observable<T>) => {
    const logger = new Logger('KindagooseModule');

    return (source: Observable<any>): Observable<T> => {
        logger.error('Caught an error when tried to connect. Retrying...');
        return source.pipe(retry({ delay: retryDelay, count: retryAttempts }));
    };
};
