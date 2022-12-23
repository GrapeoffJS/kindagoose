# Event tracking

This last chapter is dedicated to basically the main reason for creation of this library.

In `Typegoose` there is an ability to perform any type of job before or after any action. This concept inside
of `Typegoose` is called `Hook`. [More about it](https://typegoose.github.io/typegoose/docs/api/decorators/hooks/).

Before `Kindagoose` The main package for work with `Typegoose` in `NestJS`
was [`nestjs-typegoose`](https://github.com/kpfromer/nestjs-typegoose). This one time I needed to index my documents
into `ElasticSearch` and hooks looked like a great way to fit this logic, while not clogging up the other services. But
as it turned out, on `nestjs-typegoose` there are no comfortable instruments to work with hooks. Of course, I could use a
regular version of the `elasticsearch` package instead of wrapper for the `NestJS` as a crutch, or do the same with
the`Service Locator` pattern, which is an antipattern in `NestJS` context.

Let's look at how it's implemented in `kindagoose`. First, let's make a schema:

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

Then let's suppose that you, just like me, want your documents to be added into the `ElasticSearch` index after every
save. And before saving we'll do something like `console.log()`.

For that, we need to create a file in which we will put the event tracker. As a rule for naming the tracker files I submit
this template: `[schema-name].tracker.ts`.

```typescript
/* user.tracker.ts */

import { DocumentType } from '@typegoose/typegoose';
import { EventTrackerFor, Pre, Post } from 'kindagoose';

@EventTrackerFor(User)
export class UserTracker {
  constructor(private readonly elasticSearchService: ElasticSearchService) {}

  @Pre('save')
  log() {
    console.log('User will be saved');
  }

  @Post('save')
  async sendToElastic(data: DocumentType<User>) {
    await this.elasticSearchService.index('index-name', {
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
    });
  }
}
```

Let's dissect this code:

1. `@EventTrackerFor` decorator flags the given class as an event tracker for the `User` schema.
2. In the constructor we list out the necessary dependencies as usual.
3. `@Pre` decorator flags the `log` method as a method that'll react to a `save` event and is executed before the save.
   All the possible events for the given decorator are located in the `PreEvents` enum.
4. `@Post` decorator flags the `sendToElastic` method as a method that'll react to a `save` and is executed after the
   save. All the possible events for the given decorator are located in the `PostEvents` enum.

To apply our tracker just add it into the array of the providers' module, where you have registered all of your schemas.

```typescript
@Module({
  imports: [
    ElasticSearchModule.forRoot(/ * any configuration * /),
    KindagooseModule.forFeature([
      { schema: User },
    ]),
  ],
  controllers: [],
  providers: [UserTracker] /* <-- Event tracker for the User */,
})
export class UsersModule {}
```

Finally, our tracker is registered and ready for work!
