import { MongooseQueryMiddleware } from 'mongoose';

export type Hook = MongooseQueryMiddleware | MongooseQueryMiddleware[] | RegExp;
