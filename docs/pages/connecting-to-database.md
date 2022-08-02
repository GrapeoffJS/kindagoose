# Connecting to Database

To create database connection, you have to import `KindagooseModule` into the core module of your app. Traditionally, `KindagooseModule` implements three standard methods: `forRoot()`, `forRootAsync()`
and `forFeature()`.

To connect using `forRoot()`, you only have to pass the connection string with the first argument, and,
if it's needed, [`ConnectOptions`](https://mongodb.github.io/node-mongodb-native/2.2/api/MongoClient.html#connect).

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
