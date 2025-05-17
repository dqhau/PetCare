"use strict";
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Notification extends Model {
    static associate(models) {
      // Một thông báo thuộc về một người dùng
      Notification.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    }
  }

  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users", // Bảng tham chiếu
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      type: {
        type: DataTypes.ENUM("appointment", "vaccination", "boarding", "system"),
        allowNull: false,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Notification",
      timestamps: true, // Tự động thêm createdAt, updatedAt
      underscored: true, // Đổi thành kiểu snake_case
    }
  );

  return Notification;
};
