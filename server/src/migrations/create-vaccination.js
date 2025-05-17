'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vaccinations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pets',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      vaccine_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      vaccination_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      next_due_date: {
        type: Sequelize.DATE
      },
      notes: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('vaccinations');
  }
};