An external adapter that works fine in local does not work when uploaded to heroku

Hello,
 for recent chainlink hackaton i build as part of a project what is called an external adapter https://github.com/dsilberschmidt/ExternalAdapterInflation .
It worked as expected in local:

>$yarn start
>yarn run v1.22.19
>warning ../../../package.json: No license field
>$ node app.js
>Listening on port 8080!

and for client
 >curl -X POST -H "content-type:application/json" "http://localhost:8080/" --data '{"id": 0, "data": { "start_date": "1990-01-01"}}'

 returned the expected answer: a big JSON with the expected result embedded.

 When i uploaded same code in heroku i got
>curl: (35) OpenSSL SSL_connect: Connection reset by peer in connection to fathomless-beach-51915.herokuapp.com:8080

Tried to study what was happening and found:
>$heroku run bash --app fathomless-beach-51915
>Running bash on ⬢ fathomless-beach-51915... up, run.7870 (Free)
>~ $ yarn start
>yarn run v1.22.18
>$ node app.js
>node:internal/modules/cjs/loader:936
  >throw err;
  >^
>
>Error: Cannot find module 'express'
>Require stack:
>- /app/app.js
>   at Function.Module._resolveFilename
> (node:internal/modules/cjs/loader:933:15)
>  at Function.Module._load (node:internal/modules/cjs/loader:778:27)
>   at Module.require (node:internal/modules/cjs/loader:1005:19)
>    at require (node:internal/modules/cjs/helpers:102:18)
 >   at Object.<anonymous> (/app/app.js:3:17)
>    at Module._compile (node:internal/modules/cjs/loader:1105:14)
>    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1159:10)
>    at Module.load (node:internal/modules/cjs/loader:981:32)
 >   at Function.Module._load (node:internal/modules/cjs/loader:822:12)
 >   at Function.executeUserEntryPoint [as runMain]
>  (node:internal/modules/run_main:77:12) {
 > code: 'MODULE_NOT_FOUND',
 > requireStack: [ '/app/app.js' ]
>}
>error Command failed with exit code 1.
>info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.

Strange as 'express' is in package.json!

so

>~ $ yarn add express
 > >yarn add v1.22.18
 >[1/4] Resolving packages...
 >[2/4] Fetching packages...
 >[3/4] Linking dependencies...
 >warning " > eslint-plugin-import@2.20.2" has incorrect peer dependency "eslint@2.x - 6.x".
 >[4/4] Building fresh packages...
 >success Saved lockfile.
 >warning "express" is already in "devDependencies". Please remove existing entry first before adding it to "dependencies".
 >warning Your current version of Yarn is out of date. The latest version is "1.22.19", while you're on "1.22.18".
 >info To upgrade, run the following command:
 >$ curl --compressed -o- -L https://yarnpkg.com/install.sh | bash
 >success Saved 13 new dependencies.
 >info Direct dependencies
 >└─ express@4.18.1
 >info All dependencies
 >├─ accepts@1.3.8
 >├─ call-bind@1.0.2
 >├─ content-disposition@0.5.4
 >├─ cookie@0.5.0
 >├─ express@4.18.1
 >├─ finalhandler@1.2.0
 >├─ forwarded@0.2.0
 >├─ negotiator@0.6.3
 >├─ object-inspect@1.12.2
 >├─ proxy-addr@2.0.7
 >├─ serve-static@1.15.0
 >├─ side-channel@1.0.4
 >└─ toidentifier@1.0.1
 >Done in 9.88s.
 >


then body-parser was also required (even if it was in package.json)
yarn add body-parser (added)

again module express cannot be find (even if was added before)

added again succesfully

finally
>~ $ yarn start
>yarn run v1.22.18
>$ node app.js
>Listening on port 8080!

but
 >curl -X POST -H "content-type:application/json" "https://fathomless-beach-51915.herokuapp.com:8080/" --data '{"id": 0, "data": { "start_date": "1990-01-01"}}'

same situation

>curl: (35) OpenSSL SSL_connect: Connection reset by peer in connection to fathomless-beach-51915.herokuapp.com:8080


Any idea how to debug or fix this?
Same happens if I upload a docker that works fine in local.

Thanks in advance
Daniel
