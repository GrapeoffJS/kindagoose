import { AnyClass } from './any-class.interface';

/**
 * @property {AnyClass} schema - Typegoose schema.
 * @property {AnyClass} discriminators - Model discriminators.
 */
export interface ModelRegistrationOptions {
    schema: AnyClass;
    discriminators?: AnyClass[];
}
