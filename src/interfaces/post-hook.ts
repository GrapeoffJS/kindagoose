import { MongooseDocumentMiddleware, MongooseQueryMiddleware } from 'mongoose';

export type PostHook =
    | (MongooseQueryMiddleware | MongooseQueryMiddleware[] | RegExp)
    | (MongooseDocumentMiddleware | MongooseDocumentMiddleware[] | RegExp)
    | ('insertMany' | RegExp)
    | ('aggregate' | RegExp);
