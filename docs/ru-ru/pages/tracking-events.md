# Трекинг событий

Эта завершающая глава посвящена, по сути, главной причине создания данной библиотеки.

В `Typegoose` есть возможность выполнять какую-либо работу после или перед каким-либо действием. Данная концепция внутри `Typegoose` называется `Hook`. [Подробнее](https://typegoose.github.io/typegoose/docs/api/decorators/hooks/).

До `Kindagoose`, главным пакетом для работы с `Typegoose` в `NestJS` был [`nestjs-typegoose`](https://github.com/kpfromer/nestjs-typegoose). Однажды, мне понадобилось индексировать мои документы в `ElasticSearch` и хуки выглядели отличным решением, куда можно делегировать эту логику, не засоряя при этом основные сервисы.
Но как оказалось, в `nestjs-typegoose` нет никаких удобных инструментов для работы с хуками. В качестве костыля, конечно, можно было использовать обычную версию пакета `elasticsearch` вместо обёртки для `NestJS`, либо проделать это при помощи паттерна `Service Locator`, который в рамках `NestJS` является анти-паттерном.

Давайте посмотрим, как это реализовано в `kindagoose`. Для начала создадим схему:

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

!> 1. Для каждой схемы возможно сделать только один трекер событий. Kindagoose применит к схеме самый первый трекер, который попадёт к ней из списка провайдеров модуля. <br> 2. Дискриминаторы наследуют трекеры базовой схемы!

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
