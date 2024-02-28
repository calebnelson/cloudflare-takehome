import { Sequelize, DataTypes } from "sequelize";
import Surl from "./Surl.js";
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
  { host: DATABASE_HOST, dialect: "postgres" }
);

const Accession = sequelize.define("Accession", {});

Accession.belongsTo(Surl);
Surl.hasMany(Accession);

sequelize.sync({ alter: true });

export default Accession;
