"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsTo(models.Pet, { foreignKey: "pet_id", as: "pet" });
      Appointment.belongsTo(models.User, { foreignKey: "owner_id", as: "owner" });
      Appointment.belongsTo(models.PetFacility, { foreignKey: "facility_id", as: "facility" });
    }
  }

  Appointment.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      pet_id: { type: DataTypes.INTEGER, allowNull: false },
      owner_id: { type: DataTypes.INTEGER, allowNull: false },
      facility_id: { type: DataTypes.INTEGER, allowNull: false },
      facility_name: { type: DataTypes.STRING(255), allowNull: false },
      appointment_date: { type: DataTypes.DATE, allowNull: false },
      appointment_time: { type: DataTypes.TIME, allowNull: false },
      status: { type: DataTypes.ENUM("pending", "confirmed", "cancelled"), defaultValue: "pending" },
    },
    {
      sequelize,
      modelName: "Appointment",
      timestamps: true,
      underscored: true,
    }
  );

  return Appointment;
};
