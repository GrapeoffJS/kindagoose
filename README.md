# Kindagoose

Best Typegoose integration for NestJS!

[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://github.com/GrapeoffJS/kindagoose/blob/master/README.md)
[![Link to NPM](https://img.shields.io/badge/npm-kindagoose-red)](https://www.npmjs.com/package/kindagoose)

## Authors

- [@Dmitriy Grape](https://github.com/GrapeoffJS)
- [@BackOnTrack](https://github.com/BackOnTrackgithub)

## Support

For support, email me grapeoff.official@gmail.com or write an issue straight in kindagoose repository!


## Installation

To install `kindagoose`, you need to execute one of these simple commands:

#### NPM

```shell
$ npm i kindagoose @typegoose/typegoose mongoose
```

#### Yarn

```shell
$ yarn add kindagoose @typegoose/typegoose mongoose
```
## Documentation

[Full documentation is available here!](https://grapeoffjs.github.io/kindagoose)


## Usage

#### Define a schema
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

#### Register your schema like this
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

#### Use it wherever within the module

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

## License

[GPL 3.0](https://github.com/GrapeoffJS/kindagoose/blob/master/LICENSE)
