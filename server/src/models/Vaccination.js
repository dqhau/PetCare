"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Vaccination extends Model {
    static associate(models) {
      Vaccination.belongsTo(models.Pet, { foreignKey: "pet_id", as: "pet" });
    }
  }

  Vaccination.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      pet_id: { type: DataTypes.INTEGER, allowNull: false },
      vaccine_name: { type: DataTypes.STRING(100), allowNull: false },
      vaccination_date: { type: DataTypes.DATE, allowNull: false },
      next_due_date: { type: DataTypes.DATE },
      notes: { type: DataTypes.TEXT },
    },
    {
      sequelize,
      modelName: "Vaccination",
      timestamps: true,
      underscored: true,
    }
  );

  return Vaccination;
};
