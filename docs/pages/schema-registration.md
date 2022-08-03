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
  providers: [UsersService],
})
export class UsersModule {}
```

!> Notice that for every module schemas are registered separately. You can't register your schema once and globally, you should use `forFeature` every time when your module asks for some kind of model. The signature of `forFeature` is also worth looking into — The method accepts an unlimited amount of `SchemaRegistrationOptions` type objects, hence why you shouldn't duplicate it's calls.
