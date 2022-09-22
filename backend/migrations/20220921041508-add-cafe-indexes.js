'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex('cafes',['location'],);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('cafes', ['location'])
  }
};
