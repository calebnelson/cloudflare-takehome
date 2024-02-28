import { Sequelize, DataTypes } from "sequelize";

import {
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_HOST,
} from "../config.js";

const sequelize = new Sequelize(
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  {
    host: DATABASE_HOST,
    dialect: "postgres",
  }
);

const Surl = sequelize.define("Surl", {
  shortUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  longUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Surl.addIndex("surl_index", {
//   fields: ["shortUrl"],
//   unique: true,
// });

sequelize.sync({ alter: true });

export default Surl;
