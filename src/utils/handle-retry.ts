import { Logger } from '@nestjs/common';
import { delay, Observable, retryWhen, scan } from 'rxjs';

export function handleRetry(retryAttempts = 9, retryDelay = 3000): <T>(source: Observable<T>) => Observable<T> {
    const logger = new Logger('KindagooseModule');

    return <T>(source: Observable<T>) =>
        source.pipe(
            retryWhen(e =>
                e.pipe(
                    scan((errorCount, error) => {
                        logger.error(`Unable to connect to the database. Retrying (${errorCount + 1})...`, '');
                        if (errorCount + 1 >= retryAttempts) {
                            throw error;
                        }
                        return errorCount + 1;
                    }, 0),
                    delay(retryDelay),
                ),
            ),
        );
}
