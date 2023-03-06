import { MongooseDocumentMiddleware, MongooseQueryMiddleware } from 'mongoose';

export type PreHook =
    | (MongooseQueryMiddleware | MongooseQueryMiddleware[] | RegExp)
    | (MongooseDocumentMiddleware | MongooseDocumentMiddleware[] | RegExp)
    | ('insertMany' | RegExp)
    | 'aggregate'
    | 'save';
