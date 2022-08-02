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
export class AppModule {}
```

!> Чтобы не использовать длинную конструкцию со строковой интерполяцией, вы можете
импортировать `MongoDBConnectionURIBuilder` прямо из `kindagoose`!
