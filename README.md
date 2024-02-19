# Installation instructions

1. Download the latest version of npm, node, and postgresql
2. Run these commands in the psql CLI that comes with postgresql to create the database
```
CREATE DATABASE certdb;
CREATE USER admin WITH PASSWORD 'admin';
GRANT ALL PRIVILEGES ON DATABASE certdb TO admin;
```
3. Run `npm install` in the cloned repo
4. Run `node .` to start the server on the port designated in `API_PORT` in `config.js` (8080 by default) or run `npm test` to run the unit tests
