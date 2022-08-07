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
* `rxjs`: `^7.5.6 || < 9.0.0`

Итого, команда установки будет выглядеть так (предполагается, что в вашем `NestJS` проекте уже установлены пакеты
`@nestjs/common`, `@nestjs/core`, `rxjs` и `reflect-metadata` последних версий):

#### NPM

```shell
$ npm i kindagoose @typegoose/typegoose mongoose
```

#### Yarn

```shell
$ yarn add kindagoose @typegoose/typegoose mongoose
```
