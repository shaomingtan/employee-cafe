'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex('employees',['cafeId'],);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('employees',['cafeId'],);
  }
};
