# The usage of the created models

Now when your database connection is established and all of your schemas are registered, we can move onto the interesting part.
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
