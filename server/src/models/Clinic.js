"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Clinic extends Model {
    static associate(models) {
      Clinic.hasMany(models.Appointment, { foreignKey: "clinic_id" });
    }
  }

  Clinic.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      address: { type: DataTypes.TEXT, allowNull: false },
      phone: { type: DataTypes.STRING(20) },
    },
    {
      sequelize,
      modelName: "Clinic",
      tableName: "Clinics",
      timestamps: true,
      underscored: true,
    }
  );

  return Clinic;
};
