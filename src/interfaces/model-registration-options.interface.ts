import { AnyClass } from './any-class.interface';

export interface ModelRegistrationOptions {
    schema: AnyClass;
    discriminators?: AnyClass[];
    tracker?: AnyClass;
}
