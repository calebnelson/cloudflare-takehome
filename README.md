# Installation instructions

1. Download the latest version of npm, node, and postgresql
2. Using the psql CLI that comes with postgresql, create a new database called `certdb` and a new user `admin` with password `admin` that has full permissions to the database (note: these values can be changed in `config.js`)
3. Run `npm install` in the cloned repo
4. Run `node .` to start the server on the port designated in `API_PORT` in `config.js` (8080 by default) or run `npm test` to run the unit tests
