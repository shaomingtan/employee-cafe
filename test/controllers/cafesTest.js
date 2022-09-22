const request = require('supertest');
const orderBy = require('lodash').orderBy;
const expect = require("chai").expect;

const app = require('../../app')
const db = require("../../models")

const buildEmployee = (cafeId=null,startDateAtCafe=null) => ({
  name: `Sam Lim`,
  emailAddress: `sam_lim@gic.com`,
  phoneNumber: `99990000`,
  gender: 'female',
  startDateAtCafe,
  cafeId
})

const seedCafesAndEmployees = async () => {
  // Create 4 cafes with each in a different location
  const cafes = []
  const cafesToCreate = 4
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
  await db.Cafe.bulkCreate(cafes)
  
  // Create employees for cafes
  const createdCafes = await db.Cafe.findAll()
  const employees = []
  createdCafes.map(cafe => {
    switch (cafe.dataValues.location) {
      // Create 3 employees for cafes in the north
      case "north":
        employees.push(buildEmployee(
          cafe.dataValues.id,
          new Date()
        ))
        employees.push(buildEmployee(
          cafe.dataValues.id,
          new Date()
        ))
        employees.push(buildEmployee(
          cafe.dataValues.id,
          new Date()
        ))
      break;
      // Create 2 employees for cafes in the south
      case "south":
        employees.push(buildEmployee(
          cafe.dataValues.id,
          new Date()
        ))
        employees.push(buildEmployee(
          cafe.dataValues.id,
          new Date()
        ))
      break;
      // Create 1 employee for cafes in the east
      case "east":
        employees.push(buildEmployee(
          cafe.dataValues.id,
          new Date()
        ))
      break;
      // Don't create employees for cafes in the west
      case "west":
      default:
    }
  })
  await db.Employee.bulkCreate(employees)
}

describe('Cafe controller', async () => {
  describe('#listCafes', async () => {
    before(async () => {
      await seedCafesAndEmployees()
    });
    describe('when no location provided', async () => {
      it('Should send back all cafes sorted by highest number of employees first', async () => {
        // Get response
        const response = await request(app).get('/cafes')
        expect(response.status).to.eql(200)

        // Configure expected response
        const allCafes = await db.Cafe.findAll()
        const expectedResponse = allCafes.map(cafe => {
          // Set employeeCount based on employee distritbution logic in seedCafesAndEmployees
          const employeeCount = ((location) => {
            switch(location) {
              case "north": return 3
              case "south": return 2
              case "east": return 1
              case "west": return 0
            }
          })(cafe.dataValues.location)
          return {
            id: cafe.dataValues.id, 
            name: cafe.dataValues.name, 
            description: cafe.dataValues.description, 
            location: cafe.dataValues.location, 
            logo: cafe.dataValues.logo, 
            employees: employeeCount
          }
        })
        const sortedExpectedResponse = orderBy(expectedResponse,['employees'],['desc'])
        expect(response.body).to.eql(sortedExpectedResponse)
      })
    });
    describe('when location is set to north', function() {
      it('Should send back cafes in the north sorted by highest number of employees first', async () => {
        // Get response
        const response = await request(app).get('/cafes?location=north')
        expect(response.status).to.eql(200)

        // Configure expected response
        const northCafe = await db.Cafe.findAll({
          where: {
            location: 'north'
          }
        })
        const expectedResponse = [{
          id: northCafe[0].dataValues.id, 
          name: northCafe[0].dataValues.name, 
          description: northCafe[0].dataValues.description, 
          location: northCafe[0].dataValues.location, 
          logo: northCafe[0].dataValues.logo, 
          employees: 3
        }]
        expect(response.body).to.eql(expectedResponse)
      })
    });
    describe('when invalid location provided', function() {
      it('Should send back an empty list', async () => {
        // Get response
        const response = await request(app).get('/cafes?location=invalid')
        expect(response.status).to.eql(200)

        // Configure expected response
        const expectedResponse = []
        expect(response.body).to.eql(expectedResponse)
      })
    });
  })
});