module.exports = {
    async up(queryInterface, Sequelize) {
      await queryInterface.createTable('clinics', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        address: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        phone: {
          type: Sequelize.STRING(20)
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      });
    },
  
    async down(queryInterface, Sequelize) {
      await queryInterface.dropTable('clinics');
    }
  };
  