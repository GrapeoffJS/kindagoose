import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';

import { AnyClass } from '../interfaces/any-class.interface';

/**
 * Mark a class as an event tracker
 * @param {AnyClass} schema - Typegoose class that will apply listeners of this tracker
 * @constructor
 */
export const EventTrackerFor = (schema: AnyClass) =>
    applyDecorators(Injectable, SetMetadata('tracker-for', schema.name));
