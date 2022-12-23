# Adding the Discriminators

Sometimes there is a need to use the `mongoose` discriminators, let's look what we need to do to use them in the context
of `kindagoose`.

Let's repeat the example out of the `mongoose` documentation — we'll create the `Event` schema and a `ClickedEvent`
discriminator:

```typescript
/* event.schema.ts */

@modelOptions({ schemaOptions: { collection: 'Events' } })
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

As you see, nothing really changed for us. Now we need to register out schema and discriminator:

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

To attach the discriminators to the schema, we need to add the `discriminators` field into the registration object, and
then enumerate the schema discriminators inside the object.

Now, when the schema and the discriminators are registered, we can gain access to them using the syntax of dependency
injection:

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
