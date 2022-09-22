'use strict';
const db = require("../models")
const helper = require("../helper.js")

const templateEmployee = (employeeIterator, cafeIterator, cafe) => {
  const phoneNumber =  `9${Math.round(Math.random()*10000000)}`
  const startDateAtCafe = cafe ? helper.getDateXDaysAgo(Math.round(Math.random()*365)) : null

  return {
    name: `Cafe${cafeIterator}: Sam Lim${employeeIterator}`,
    emailAddress: `cafe${cafeIterator}_sam_lim${employeeIterator}@gic.com`,
    phoneNumber,
    gender: employeeIterator%2===1 ? 'female': 'male',
    cafeId: cafe ? cafe.dataValues.id : null,
    startDateAtCafe,
  }
}

module.exports = {
  async up (queryInterface, Sequelize) {
    const employeesToCreatePerCafe = 10000
    const cafes = await db.Cafe.findAll()

    // Seed employees who do not belong to a cafe
    const nonCafeEmployees = []
    for(let j=0; j<employeesToCreatePerCafe; j++){
      nonCafeEmployees.push(templateEmployee(j,"-none",null))
    }
    await db.Employee.bulkCreate(nonCafeEmployees)

    // Seed employees per cafe
    for(let i=0; i<cafes.length; i++){
      const employees = []
      const cafe = cafes[i]
      for(let j=0; j<employeesToCreatePerCafe-i; j++){
        employees.push(templateEmployee(i,j,cafe))
      }
      await db.Employee.bulkCreate(employees)
    }
    return
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Employees', null, {});
  }
};
