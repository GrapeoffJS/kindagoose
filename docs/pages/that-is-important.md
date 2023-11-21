# That's important

The main focus when creating `kindagoose` was to fix the problems of its predecessor
— [nestjs-typegoose](https://github.com/kpfromer/nestjs-typegoose), one of which was its usage of outdated versions of
packages. For this very reason, `kindagoose` inside `peerDependencies` demands for the given packages of the following
versions to be installed when working on your project:

* `@nestjs/common`: `>=10.2.10`
* `@nestjs/core`: `>=10.2.10`
* `@typegoose/typegoose`: `>=11.7.1`
* `mongoose`: `>=8.0.1`
* `reflect-metadata`: `>=0.1.13`
* `rxjs`: `^7.5.6 || < 9.0.0`

As you can see, for now these are one of the latest versions of the given packages for the moment of writing this lines. Someone may notice that `kindagoose` actually works perfectly even with the older versions of these packages and
may say that making the new versions to be up-to-date as a requirement is inexpedient. But I made this decision because
I wanted to distance the obsolescence of my library as much as possible in case if I am not able to support it
anymore.

Out of all of this you can also make a conclusion that it's better to use `Kindagoose` in the newer projects, than
trying to renovate your legacy-code on it.
