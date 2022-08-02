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
