# Schema creation

Before starting to work with the database, it's necessary to create a schema and then a model based on it.
The process of schema creation is beautifully illustrated in the [official documentation](https://typegoose.github.io/typegoose/docs/guides/quick-start-guide) `Typegoose`. For example, let's describe the schema of a user for the `ToDo List` app.

```typescript
@modelOptions({ schemaOptions: { collection: 'Users' } })
export class User extends TimeStamps {
  @prop({ unique: true })
  login: string;

  @prop()
  firstName: string;

  @prop()
  lastName: string;

  @prop({ type: () => Date })
  age: Date;

  @prop()
  password: string;

  @prop({ type: () => [Task], localField: '_id', foreignField: 'owner_id' })
  tasks: Ref<Task>[];
}
```
