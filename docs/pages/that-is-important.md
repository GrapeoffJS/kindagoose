# That's important

The main focus when creating `kindagoose` was to fix the problems of its predecessor
— [nestjs-typegoose](https://github.com/kpfromer/nestjs-typegoose), one of which was its usage of outdated versions of
packages. For this very reason, `kindagoose` inside `peerDependencies` demands for the given packages of the following
versions to be installed when working on your project:

* `@nestjs/common`: `>=9.0.0`
* `@nestjs/core`: `>=9.0.0`
* `@typegoose/typegoose`: `>=9.11.0`
* `mongoose`: `>=6.5.0`
* `reflect-metadata`: `>=0.1.13`
* `rxjs`: `^7.5.6 || < 9.0.0`

As you can see, for now these are one of the latest versions of the given packages at the time of the first half of
2022. Someone may notice that `kindagoose` actually works perfectly even with the older versions of these packages and
may say that making the new versions to be up-to-date as a requirement is inexpedient. But I made this decision because
I wanted to distance the obsolescence of my library as much as possible in case if I am not able to support it
anymore.

Out of all of this you can also make a conclusion that it's better to use `Kindagoose` in the newer projects, than
trying to renovate your legacy-code on it.
