"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Pet extends Model {
    static associate(models) {
      Pet.belongsTo(models.User, { foreignKey: "owner_id", as: "owner" });
      Pet.hasMany(models.Vaccination, { foreignKey: "pet_id", as: "vaccinations" });
      Pet.hasMany(models.Appointment, { foreignKey: "pet_id", as: "appointments" });
      Pet.hasMany(models.BoardingReservation, { foreignKey: "pet_id", as: "boarding_reservations" });
    }
  }

  Pet.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      owner_id: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING(50), allowNull: false },
      species: { type: DataTypes.STRING(50), allowNull: false },
      gender: { type: DataTypes.ENUM("male", "female") },
      dob: { type: DataTypes.DATE },
    },
    {
      sequelize,
      modelName: "Pet",
      timestamps: true,
      underscored: true,
    }
  );

  return Pet;
};
