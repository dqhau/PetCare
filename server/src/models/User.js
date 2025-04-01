"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Pet, { foreignKey: "owner_id", as: "pets" });
      User.hasMany(models.Appointment, { foreignKey: "owner_id", as: "appointments" });
      User.hasMany(models.BoardingReservation, { foreignKey: "owner_id", as: "boarding_reservations" });
      User.hasOne(models.PetFacility, { foreignKey: "user_id", as: "facility" });
      User.hasMany(models.Notification, { foreignKey: "user_id", as: "notifications" });
    }
  }

  User.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      full_name: { type: DataTypes.STRING(100), allowNull: false },
      phone: { type: DataTypes.STRING(15) },
      address: { type: DataTypes.STRING(255) },
      role: { type: DataTypes.ENUM("user", "clinic", "admin"), defaultValue: "user" },
      reset_token: { type: DataTypes.STRING, allowNull: true },
      reset_expires: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "User",
      timestamps: true,
      underscored: true, // chuyển đổi các tên cột từ camelCase thành snake_case trong database.
    }
  );

  return User;
};
