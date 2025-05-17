'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      pet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Pets',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      facility_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pet_facilities',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      appointment_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'canceled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('appointments');
  }
};
