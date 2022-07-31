import { AnyClass } from './any-class.interface';

/**
 * @property {AnyClass} schema - Typegoose schema.
 * @property {AnyClass} discriminators - Model discriminators.
 * @property {AnyClass} tracker - Event tracker.
 */
export interface ModelRegistrationOptions {
    schema: AnyClass;
    discriminators?: AnyClass[];
    tracker?: AnyClass;
}
