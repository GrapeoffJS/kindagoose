# Добавление дискриминаторов

Иногда у нас появляется необходимость использовать дискриминаторы `mongoose`, давайте посмотрим, что для их
использования необходимо проделать в рамках `kindagoose`.

Повторим пример из документации `mongoose` — создадим схему `Event` и дискриминатор `ClickedEvent`:

```typescript
/* event.schema.ts */

@modelOptions({ schemaOptions: { collection: 'Events' }})
export class Event {
  @prop()
  time: Date;
}
```

```typescript
/* clicked-event.schema.ts */

export class ClickedEvent extends Event {
  @prop()
  url: string;
}
```

Как видите, пока что для нас ничего не поменялось. Теперь нужно зарегистрировать нашу схему и дискриминатор:

```typescript
@Module({
  imports: [
    KindagooseModule.forFeature([
      { schema: Event, discriminators: [ClickedEvent] },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class EventsModule {}
```

Чтобы прикреплять дискриминаторы к схеме, необходимо добавить поле `discriminators` в объект регистрации, а уже в нём
перечислить все дискриминаторы схемы.

Теперь, когда схема и дискриминаторы зарегистрированы, мы можем получить к ним доступ благодаря синтаксису инъекции
зависимостей:

```typescript
@Injectable()
export class EventsService {
  constructor(
      @InjectModel(Event)
      private readonly eventModel: ReturnModelType<typeof Event>,
      @InjectModel(ClickedEvent)
      private readonly clickedEventModel: ReturnModelType<typeof ClickedEvent>,
  ) {}

  async getAllEvents() {
    return this.eventModel.find().exec();
  }

  async getAllClickedEvents() {
    return this.clickedEventModel.find().exec()
  }
}
```
