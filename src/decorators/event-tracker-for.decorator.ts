import { applyDecorators, Injectable, ScopeOptions, SetMetadata } from '@nestjs/common';

import { AnyClass } from '../interfaces/any-class.interface';

/**
 * Mark a class as an event tracker
 * @param {AnyClass} schema - Typegoose class that will apply listeners of this tracker
 * @param {ScopeOptions} injectionOptions - Injection scope options
 * @constructor
 */
export const EventTrackerFor = (schema: AnyClass, injectionOptions?: ScopeOptions) =>
    applyDecorators(SetMetadata('tracker-for', schema.name), Injectable(injectionOptions));
