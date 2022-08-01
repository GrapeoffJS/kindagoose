# Установка

Чтобы установить `kindagoose`, необходимо выполнить одну из этих простых команд:

#### NPM

```shell
$ npm i kindagoose
```

#### Yarn

```shell
$ yarn add kindagoose
```

Однако для работы модуля также необходимы перечисленные ниже пакеты:

* `@nestjs/common`: `>=9.0.0`
* `@nestjs/core`: `>=9.0.0`
* `@typegoose/typegoose`: `>=9.11.0`
* `mongoose`: `>=6.5.0`
* `reflect-metadata`: `>=0.1.13`

Итого, команда установки будет выглядеть так (предполагается, что в вашем `NestJS` проекте уже установлены пакеты
`@nestjs/common`, `@nestjs/core` и `reflect-metadata` последних версий):

#### NPM

```shell
$ npm i kindagoose @typegoose/typegoose mongoose
```

#### Yarn

```shell
$ yarn add kindagoose @typegoose/typegoose mongoose
```

#

# Подключение к базе данных

Чтобы создать подключение к базе данных, вам необходимо импортировать `KindagooseModule` в корневой модуль вашего
приложения. По традиции, `KindagooseModule` реализует три стандартных метода: `forRoot()`, `forRootAsync()`
и `forFeature()`.

Чтобы подключиться при помощи `forRoot()`, вам необходимо всего лишь передать строку подключения первым аргументом, и,
если требуется, настройки
подключения ([`ConnectOptions`](https://mongodb.github.io/node-mongodb-native/2.2/api/MongoClient.html#connect)).

Пример с `forRoot()`:

```typescript
@Module({
  imports: [
    KindagooseModule.forRoot('ВАША ССЫЛКА ДЛЯ ПОДКЛЮЧЕНИЯ', {
      dbName: 'ИМЯ БАЗЫ ДАННЫХ',
      authSource: 'admin',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

Но иногда вам может понадобиться создавать `Connection URI` динамически, получая значения из переменных среды. В таком
случае, вам следует использовать `forRootAsync()`:

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

!> Чтобы не использовать длинную конструкцию со строковой интерполяцией, вы можете
импортировать `MongoDBConnectionURIBuilder` прямо из `kindagoose`!

---

#

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

#

# Регистрация схемы

Теперь, нам необходимо зарегистрировать нашу схему, чтобы `kindagoose` смог превратить её в модель, поддерживающую
инъекцию зависимостей `NestJS`! Чтобы зарегистрировать схему, вам необходимо вызвать метод `forFeature`
у `KindagooseModule`:

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

!> Заметьте, что для каждого модуля схемы регистрируются отдельно. Вы не можете зарегистрировать схему один раз и
глобально, вы должны использовать `forFeature` всякий раз, как ваш модуль требует какую-либо модель. Также стоит
взглянуть на сигнатуру `forFeature` — метод принимает в себя неограниченное количество объектов
типа `SchemaRegistrationOptions`, поэтому, вам не стоит дублировать его вызовы.

#

# Использование полученных моделей

Теперь, когда подключение с базой данных установлено, а схемы зарегистрированы, мы можем перейти к самому интересному.
Доступ к вашим моделям может получить абсолютно любой провайдер, который находится в пределах модуля, где были
зарегистрированы схемы. Давайте посмотрим, что для этого нужно сделать.

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

Как вы можете заметить, для получения доступа к модели используется специальный декоратор `@InjectModel()`, который
принимает в себя `Typegoose` схему. Чтобы указать тип нашей модели, используется специальный `Utility Type`, который
импортируется прямиком из `@typegoose/typegoose`.

Далее, как обычно, используем методы сервиса в нашем контроллере:

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

Вуаля!

---

#

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

#
# Трекинг событий
Эта завершающая глава посвящена, по сути, главной причине создания данной библиотеки.

В `Typegoose` есть возможность выполнять какую-либо работу после или перед каким-либо действием. Данная концепция внутри `Typegoose` называется `Hook`. [Подробнее](https://typegoose.github.io/typegoose/docs/api/decorators/hooks/).

До `Kindagoose`, главным пакетом для работы с `Typegoose` в `NestJS` был [`nestjs-typegoose`](https://github.com/kpfromer/nestjs-typegoose). Однажды, мне понадобилось индексировать мои документы в `ElasticSearch` и хуки выглядели отличным решением, куда можно делегировать эту логику, не засоряя при этом основные сервисы.
Но как оказалось, в `nestjs-typegoose` нет никаких удобных инструментов для работы с хуками. В качестве костыля, конечно, можно было использовать обычную версию пакета `elasticsearch` вместо обёртки для `NestJS`, либо проделать это при помощи паттерна `Service Locator`, который в рамках `NestJS` является анти-паттерном.

Давайте посмотрим, как это реализовано в `kindagoose`. Для начала создадим схему:

```typescript
@modelOptions({ schemaOptions: { collection: 'Users' } })
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

Затем, предположим, что вы, как и я, хотите добавлять ваши документы в индекс `ElasticSearch` после каждого сохранения. А перед сохранением просто будем делать какой-нибудь `console.log()`.

Для этого нам нужно создать файл, где мы разместим наш трекер событий. В качестве правил именования файлов трекеров я предлагаю такой шаблон: `[schema-name].tracker.ts`.

```typescript
/* user.tracker.ts */

import { DocumentType } from '@typegoose/typegoose';
import { EventTrackerFor, Pre, Post, PostEvents, PreEvents } from 'kindagoose';

@EventTrackerFor(User)
export class UserTracker {
  constructor(private readonly elasticSearchService: ElasticSearchService) {}

  @Pre(PreEvents.SAVE)
  log() {
    console.log('Пользователь будет сохранён');
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

Рассмотрим этот код поближе:
1. Декоратор `@EventTrackerFor` помечает данный класс как трекер событий для схемы `User`.
2. В конструкторе мы как обычно перечисляем список необходимых зависимостей.
3. Декоратор `@Pre` помечает метод `log` как метод, который будет реагировать на событие `save` и будет вызван перед сохранением. Все возможные события для данного декоратора находятся в перечислении `PreEvents`.
4. Декоратор `@Post` помечает метод `sendToElastic` как метод, который будет реагировать на событие `save` и будет вызван после сохранения. Все возможные события для данного декоратора находятся в перечислении `PostEvents`.

Чтобы применить наш трекер, просто добавьте его в массив провайдеров модуля, в котором вы зарегистрировали ваши схемы.

```typescript
@Module({
  imports: [
    ElasticSearchModule.forRoot(/ * Какая-либо конфигурация * /),
    KindagooseModule.forFeature([
      { schema: User },
    ]),
  ],
  controllers: [],
  providers: [UserTracker] /* <-- Трекер событий для пользователя */,
})
export class UsersModule {}
```

Наконец, наш трекер зарегистрирован и готов к работе!

---

#
# Дальнейшая поддержка пакета
`Kindagoose` вряд ли будет заброшен в ближайшее время, поэтому вы можете в любое время задать свой вопрос, сообщить о проблеме или предложить реализацию чего-либо в [issues](https://github.com/GrapeoffJS/kindagoose/issues) в репозитории данного проекта.

#
# Особые благодарности
1. [Федору Рыбакову](https://github.com/fjodor-rybakov) за помощь с аспектами `NestJS`, которые не были описаны в документации на момент создания данного пакета. [Подробнее](https://ru.stackoverflow.com/questions/1433421/%d0%9a%d0%b0%d0%ba-%d0%b4%d0%be%d1%81%d1%82%d0%b0%d1%82%d1%8c-%d0%bc%d0%b5%d1%82%d0%be%d0%b4-%d0%b8-%d0%bc%d0%b5%d1%82%d0%b0%d0%b4%d0%b0%d0%bd%d0%bd%d1%8b%d0%b5-%d0%b8%d0%b7-%d0%bf%d1%80%d0%be%d0%b2%d0%b0%d0%b9%d0%b4%d0%b5%d1%80%d0%b0-%d0%b2-nestjs)
2. [Алексею](https://github.com/DeityLamb) за решение проблемы с доступом к зависимостям трекера событий при передаче его методов в качестве обработчиков хуков `Typegoose`.
