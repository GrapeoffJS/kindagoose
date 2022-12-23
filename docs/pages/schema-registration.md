# Schema registration

Now we have to register our schema, for `kindagoose` to turn it into a model, supporting dependency injection `NestJS`!
To register a schema, you need to use the method `forFeature` of `KindagooseModule`:

```typescript
@Module({
  imports: [
    KindagooseModule.forFeature([
      User,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

!> Notice that for all module schemas are registered separately. You can't register your schema once and globally, you
should use `forFeature` every time when your module asks for some kind of model.
The signature of `forFeature` is also
worth looking into —
The method accepts an unlimited amount of `(AnyClass | SchemaRegistrationOptions)` type objects, hence you
shouldn't duplicate its calls.
