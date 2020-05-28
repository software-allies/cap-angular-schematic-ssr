# cap-angular-schematic-ssr  [![NPM version](https://badge.fury.io/js/CAP.svg)](https://npmjs.org/package/CAP) [![Build Status](https://travis-ci.org/Elena%20M.%20Sarabia/CAP.svg?branch=master)](https://travis-ci.org/Elena%20M.%20Sarabia/CAP) [![Generic badge](https://img.shields.io/badge/CAP-Active-<COLOR>.svg)](https://shields.io/)
 This repository is a basic Schematic implementation that add a Interceptor with the  Transfer Http Response for SSR request and Cache for Browser requests features.

## Prerequisites
* Have an Angular app.
* Have  npm 6.13.7 or superior.
* [Node](https://nodejs.org/en/download/current) 10.6 to the current. 


## Installation
To run the schematic, execute the following command.
```
ng add cap-angular-schematic-ssr 
```

# Important
- This schematic should be installed after Angular Universal.

Verify in you app.server.module.ts that is 
- ServerTransferStateModule
imported from '@angular/platform-server';

​
## The Schematic will create a ssr plate scaffold application with the next features:

- Cache Request Interceptor.

Touched files:

```
app
    |-- modules/
        |-- cap-ssr/
            |-- services/
                |-- transfer-state-http-cache.interceptor.ts
            |-- cap-ssr-module.ts

```

# What does this Schematic
* This Schematic install a Interceptor Service and a Module placed under src/app/modules/cap-ssr and import the module to app.server.ts.

* With this Transfer State Http Cache Interceptor is possible to avoid duplicated requests (first on server after on browser) on a SSR aplication and use a Cache feature for avoid repeated request on the browser.

## Important
Configure the CanCache Method to only set to Cache specific Urls.

```
  canCache(req: HttpRequest<any>): boolean {
    return (req.url.includes('ifthistextispartoftheurl'));
  }
}
```


## Usage
angular 8, 9

## Built With
[Schematic](https://www.schematics.com/)

## Authors
Software Allies - [Software Allies](https://github.com/software-allies)
​
### Contributor 
César Alonso Magaña Gavilanes - [cesaralonso](https://github.com/cesaralonso)

## License
MIT © [Software Allies](https://github.com/software-allies/cap-angular-schematic-ssr)