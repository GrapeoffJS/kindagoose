/**
 * Contains all event names for `post` hook.
 */
export enum PostEvents {
    COUNT = 'count',
    FIND = 'find',
    FIND_ONE = 'findOne',
    FIND_ONE_AND_REMOVE = 'findOneAndRemove',
    FIND_ONE_AND_UPDATE = 'findOneAndUpdate',
    UPDATE = 'update',
    UPDATE_ONE = 'updateOne',
    UPDATE_MANY = 'updateMany',
    FIND_ONE_AND_DELETE = 'findOneAndDelete',
    DELETE_ONE = 'deleteOne',
    DELETE_MANY = 'deleteMany',
    INSERT_MANY = 'insertMany',
    INIT = 'init',
    VALIDATE = 'validate',
    SAVE = 'save',
    REMOVE = 'remove',
    COUNT_DOCUMENTS = 'countDocuments',
    ESTIMATED_DOCUMENT_COUNT = 'estimatedDocumentCount',
}
