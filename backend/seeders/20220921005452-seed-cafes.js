'use strict';
const db = require("../models")

module.exports = {
  async up (queryInterface, Sequelize) {
    const cafes = []
    const cafesToCreate = 100
    for(let i=0; i<cafesToCreate;i++){
      const location = ((i) => {
        switch(i%4){
          case 0: return "north"
          case 1: return "south"
          case 2: return "east"
          case 3: return "west"
        }
      })(i)

      cafes.push({
        name: `Cafe ${i}`,
        description: `Cafe ${i} description`,
        location,
      })
    }
    return db.Cafe.bulkCreate(cafes)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Cafes', null, {});
  }
};
