# Installation

To install `kindagoose`, you need to execute one of these simple commands:

#### NPM

```shell
$ npm i kindagoose
```

#### Yarn

```shell
$ yarn add kindagoose
```

However for the module to work you also need the following packages:

* `@nestjs/common`: `>=9.0.0`
* `@nestjs/core`: `>=9.0.0`
* `@typegoose/typegoose`: `>=9.11.0`
* `mongoose`: `>=6.5.0`
* `reflect-metadata`: `>=0.1.13`

In total, the install command should look like this (It is assumed you have already installed the packages `@nestjs/common`, `@nestjs/core` and `reflect-metadata` of the latest versions in your `NestJS` project):

#### NPM

```shell
$ npm i kindagoose @typegoose/typegoose mongoose
```

#### Yarn

```shell
$ yarn add kindagoose @typegoose/typegoose mongoose
```

#

# Connecting to Database

To create database connection, you have to import `KindagooseModule` into the core module of your app. Traditionally, `KindagooseModule` implements three standard methods: `forRoot()`, `forRootAsync()`
and `forFeature()`.

To connect using `forRoot()`, you only have to pass the connection string with the first argument, and,
if it's needed, ([`ConnectOptions`](https://mongodb.github.io/node-mongodb-native/2.2/api/MongoClient.html#connect)).

Example with `forRoot()`:

```typescript
@Module({
  imports: [
    KindagooseModule.forRoot('YOUR CONNECTION URI', {
      dbName: 'DATABASE NAME',
      authSource: 'admin',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

But sometimes you may need to create `Connection URI` dynamically, while getting values from the variables of the environment. In this case, you should use `forRootAsync()`:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({cache: true, isGlobal: true}),
    KindagooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          uri: `${configService.get('MONGODB_PROTOCOL')}://${configService.get('MONGODB_USERNAME')}:${configService.get('MONGODB_PASSWORD')}@${configService.get('MONGODB_HOST')}:${configService.get('MONGODB_PORT')}/${configService.get('MONGODB_DEFAULT_DATABASE')}`,
        };
      },
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

!> If you don't want to use the long construction with the string interpolation, you can import `MongoDBConnectionURIBuilder` straight out of `kindagoose`!

---

#

# Schema creation

Before starting to work with the database, it's necessary to create a schema and then a model based on it.
The process of schema creation is beautifully illustrated in the [official documentation](https://typegoose.github.io/typegoose/docs/guides/quick-start-guide) `Typegoose`. For example, let's describe the schema of a user for the `ToDo List` app.

```typescript
@modelOptions({schemaOptions: {collection: 'Users'}})
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

#

# Schema registration

Now we have to register our schema, for `kindagoose` to turn it into a model, supporting dependency injection `NestJS`! To register a schema, you need to use the method `forFeature` of `KindagooseModule`:

```typescript
@Module({
  imports: [
    KindagooseModule.forFeature([
      { schema: User },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class UsersModule {}
```

!> Notice that for every module schemas are registered separately. You can't register your schema once and globally, you should use `forFeature` every time when your module asks for some kind of model. The signature of `forFeature` is also worth looking into — The method accepts an unlimited amount of `SchemaRegistrationOptions` type objects, hence why you shouldn't duplicate it's calls.

#

# The usage of the created models

Now when your database connection is settled and all of your schemas are registered, we can move onto the interesting part.
Absolutely every provider that's in the range of the module where the schemas have been registered is able to gain access to your models. Let's look at what they need to do to get the access.

```typescript
import { InjectModel } from "kindagoose";
import { ReturnModelType } from "@typegoose/typegoose";

@Injectable()
export class UsersService {
  constructor(
      @InjectModel(User)
      private readonly userModel: ReturnModelType<typeof User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return this.userModel.create(createUserDto);
  }

  async get({ limit, offset }: PaginationDto) {
    return this.userModel.find().skip(offset).limit(limit).exec();
  }

  async getById(id: string) {
    return this.userModel.findById(id).exec();
  }
}
```

As you can see, to get the access to the model, a special decorator `@InjectModel()` is used, which accepts the `Typegoose` schema. To indicate the type of our model, a special `Utility Type` is used, which is imported straight out of `@typegoose/typegoose`.

Then we use the service methods in our controller as usual:

```typescript
@Controller()
export class UsersController {
  constructor(
      private readonly usersService: UsersService
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get()
  async get(@Query() paginationDto: PaginationDto) {
    return await this.userService.get(paginationDto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.userService.getById(id)
  }
}
```

Voilà!

---

#

# Adding the Discriminators

Sometimes there is a need to use the `mongoose` discriminators, let's look what we need to do to use them in the borders of `kindagoose`.

Let's repeat the example out of the `mongoose` documentation — we'll create the `Event` schema and a `ClickedEvent` discriminator:

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

To attach the discriminators to the schema, we need to add the `discriminators` field into the object of the registration, and then enumerate the schema discriminators inside of the object

Now when the schema and the discriminators are registered, we can gain access to them using the syntax of dependency injection:

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

#
# Event tracking
This last chapter is dedicated to basically the main reason of creation of this library.

In `Typegoose` there is an ability to perform any type of job before or after any action. This concept inside of `Typegoose` is called `Hook`. [More about it](https://typegoose.github.io/typegoose/docs/api/decorators/hooks/).

Before `Kindagoose`The main package for work with `Typegoose` in `NestJS` was [`nestjs-typegoose`](https://github.com/kpfromer/nestjs-typegoose). This one time i needed to index my documents into `ElasticSearch` and hooks looked like a great way to fit this logic, while not clogging up the other services.
But as it turned out, on `nestjs-typegoose` there's no comfortable instruments to work with hooks. Of course i could use a regular version of the `elasticsearch` package insted of wrapper for the `NestJS` as a crutch, or do the same with the`Service Locator` pattern, which is an anti-pattern in`NestJS` borders.

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

Then let's suppose that you, just like me, want to your documents to be added into the `ElasticSearch` index after every save. And before saving we'll do something like `console.log()`.

For that we need to create a file in which we'll put the event tracker. As a rule for naming the tracker files i submit this template: `[schema-name].tracker.ts`.

```typescript
/* user.tracker.ts */

import { DocumentType } from '@typegoose/typegoose';
import { EventTrackerFor, Pre, Post, PostEvents, PreEvents } from 'kindagoose';

@EventTrackerFor(User)
export class UserTracker {
  constructor(private readonly elasticSearchService: ElasticSearchService) {}

  @Pre(PreEvents.SAVE)
  log() {
    console.log('User will be saved');
  }

  @Post(PostEvents.SAVE)
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
2. In the constructor we list out the necessary dependencies as usual,
3. `@Pre` decorator flags the `log` method as a method that'll react to a `save` event and is executed before the save. All the possible events for the given decorator are located in the `PreEvents` enum.
4. `@Post` decorator flags the `sendToElastic` method as a method that'll react to a `save` and is executed after the save. All the possible events for the given decorator are located in the `PostEvents` enum.

To apply our tracker just add it into the massive of the providers module, where you have registered all of your schemas.

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

---

#
# Further support of the package
It's unlikely that `Kindagoose` will be abandoned in the near future, that's why you can ask your question, report your problem or submit an implementation of any kind any time at [issues](https://github.com/GrapeoffJS/kindagoose/issues) in the repository of this project.

#
# Special Thanks
1. [Fjodor Rybakov](https://github.com/fjodor-rybakov) for helping with the `NestJS` aspects that weren't described in the documentation at the time of this packages creation. [More about it](https://ru.stackoverflow.com/questions/1433421/%d0%9a%d0%b0%d0%ba-%d0%b4%d0%be%d1%81%d1%82%d0%b0%d1%82%d1%8c-%d0%bc%d0%b5%d1%82%d0%be%d0%b4-%d0%b8-%d0%bc%d0%b5%d1%82%d0%b0%d0%b4%d0%b0%d0%bd%d0%bd%d1%8b%d0%b5-%d0%b8%d0%b7-%d0%bf%d1%80%d0%be%d0%b2%d0%b0%d0%b9%d0%b4%d0%b5%d1%80%d0%b0-%d0%b2-nestjs)
2. [Alexei](https://github.com/DeityLamb) for solving the problem with the access to the event tracker dependencies when transferring it's methods as a processor of the `Typegoose` hooks.
3. [Artyom](https://github.com/BackOnTrackgithub) for translating this page from Russian to English!
