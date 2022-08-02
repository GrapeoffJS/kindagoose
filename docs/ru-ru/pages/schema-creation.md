# Создание схемы

Перед тем, как начать работать непосредственно с базой данных, необходимо создать схему, а затем модель на её основе.
Процесс создания схемы замечательно описан
в [официальной документации](https://typegoose.github.io/typegoose/docs/guides/quick-start-guide) `Typegoose`. Для
примера, опишем схему пользователя для приложения `ToDo List`.

```typescript
@modelOptions({schemaOptions: {collection: 'Users'}})
export class User extends TimeStamps {
  @prop({unique: true})
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
