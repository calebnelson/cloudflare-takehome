import { Sequelize, DataTypes } from 'sequelize';
import Customer from './Customer.js';
import {
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_HOST,
} from '../config.js';

const sequelize = new Sequelize(
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
  {
    host: DATABASE_HOST,
    dialect: "postgres",
  }
);

const Certificate = sequelize.define("Certificate", {
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  privateKey: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  certBody: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Certificate.belongsTo(Customer);
Customer.hasMany(Certificate);

export default Certificate;
