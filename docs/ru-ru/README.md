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
`@nestjs/common`, `@nestjs/core`, `reflect-metadata` последних версий):

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
    KindagooseModule.forRoot('YOUR URI HERE', {
      dbName: 'AnyDatabaseName',
      authSource: 'admin',
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
}
```

Но иногда вам может понадобиться создавать `Connection URI` динамически, получая значения из переменных среды. В таком
случае, вам следует использовать `forRootAsync()`:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
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
export class AppModule {
}
```

!> Чтобы не использовать длинную конструкцию со строковой интерполяцией, вы можете
импортировать `MongoDBConnectionURIBuilder` прямо из `kindagoose`!

---

# Создание схемы

Перед тем, как начать работать непосредственно с базой данных, необходимо создать схему, а затем модель на её основе.
Процесс создания схемы замечательно описан
в [официальной документации](https://typegoose.github.io/typegoose/docs/guides/quick-start-guide) `Typegoose`. Для
примера, опишем схему пользователя для приложения `ToDo List`.

```typescript
@modelOptions({ schemaOptions: {collection: 'Users' }})
export class User extends TimeStamps {
  @prop({ unique: true })
  login: string;

  @prop()
  firstName: string;

  @prop()
  lastName: string;

  @prop({type: () => Date})
  age: Date;

  @prop()
  password: string;

  @prop({type: () => [Task], localField: '_id', foreignField: 'owner_id'})
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
      {schema: User},
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

  async get({limit, offset}: PaginationDto) {
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
