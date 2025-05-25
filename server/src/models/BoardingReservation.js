"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class BoardingReservation extends Model {
    static associate(models) {
      BoardingReservation.belongsTo(models.Pet, { foreignKey: "pet_id", as: "pet" });
      BoardingReservation.belongsTo(models.User, { foreignKey: "owner_id", as: "owner" });
      BoardingReservation.belongsTo(models.PetFacility, { foreignKey: "facility_id", as: "facility" });
    }
  }

  BoardingReservation.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      pet_id: { type: DataTypes.INTEGER, allowNull: false },
      owner_id: { type: DataTypes.INTEGER, allowNull: false },
      facility_id: { type: DataTypes.INTEGER },
      check_in_date: { type: DataTypes.DATE, allowNull: false },
      check_out_date: { type: DataTypes.DATE, allowNull: false },
      status: { type: DataTypes.ENUM("pending", "confirmed", "cancelled"), defaultValue: "pending" },
    },
    {
      sequelize,
      modelName: "BoardingReservation",
      timestamps: true,
      underscored: true,
    }
  );

  return BoardingReservation;
};
