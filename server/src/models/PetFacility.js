"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class PetFacility extends Model {
    static associate(models) {
      PetFacility.belongsTo(models.User, { foreignKey: "user_id", as: "owner" });
      PetFacility.hasMany(models.Appointment, { foreignKey: "facility_id", as: "appointments" });
      PetFacility.hasMany(models.BoardingReservation, { foreignKey: "facility_id", as: "boarding_reservations" });
    }
  }

  PetFacility.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      address: { type: DataTypes.STRING(255), allowNull: false },
      phone: { type: DataTypes.STRING(15), allowNull: false },
      email: { type: DataTypes.STRING(100), unique: true },
      services: { type: DataTypes.ENUM("clinic", "boarding", "both"), allowNull: false },
    },
    {
      sequelize,
      modelName: "PetFacility",
      timestamps: true,
      underscored: true,
    }
  );

  return PetFacility;
};
