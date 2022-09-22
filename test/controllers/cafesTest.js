const request = require('supertest');
const orderBy = require('lodash').orderBy;
const expect = require("chai").expect;

const app = require('../../app')
const db = require("../../models")
const testHelper = require("../testHelper.js")

describe('Cafe controller', async () => {
  beforeEach(async () => {
    await testHelper.clearDB()
  })
  describe('#listCafes', async () => {
    beforeEach(async () => {
      // Create 4 cafes and employees working in the cafe
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
    describe('when location is set to north', async () => {
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
    describe('when invalid location provided', async () => {
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
  describe('#createCafe', async () => {
    describe('When required params are present', async () => {
      it('Should create 1 new cafe', async () => {
        // Send request
        const payload = {
          "name": "Cafe 1",
          "description": "Cafe 1 description",
          "location": "west"
        }
        const response = await request(app).post('/cafe').send(payload)
        expect(response.status).to.eql(200)

        // 1 cafe created
        const cafes = await db.Cafe.findAll()
        expect(cafes.length).to.eql(1)
      })
    })
    describe('When required params ie name is not present', async () => {
      it('Should not create a new cafe', async () => {
        // Send request
        const payload = {
          "description": "Cafe 1 description",
          "location": "west"
        }
        const response = await request(app).post('/cafe').send(payload)
        expect(response.status).to.eql(400)
        // Returns validation error
        expect(response.body).to.eql({ name: 'Cafe.name cannot be null' })

        // 0 cafe created
        const cafes = await db.Cafe.findAll()
        expect(cafes.length).to.eql(0)
      })
    })
  })
  describe('#updateCafe', async () => {
    // Create a single cafe entry
    beforeEach(async () => {
      await db.Cafe.create({
        name: "Cafe 1",
        description: "cafe 1 description",
        location: "west"
      })
    })
    describe('When cafeId is valid', async () => {
      it('Should update cafe with new values', async () => {
        // Get cafeId
        const existingCafes = await db.Cafe.findAll()
        const existingCafeId = existingCafes[0].dataValues.id

        // Send request
        const newName = "Cafe 2"
        const response = await request(app).put(`/cafe/${existingCafeId}`).send({name: newName})
        expect(response.status).to.eql(200)

        // Check that name was updated
        const cafe = await db.Cafe.findByPk(existingCafeId)
        expect(cafe.name).to.eql(newName)
      })
    })
    describe('When cafeId is invalid', async () => {
      it('Should return an error', async () => {
        // Send request
        const newName = "Cafe 2"
        const wrongCafeId = '123'
        const response = await request(app).put(`/cafe/${wrongCafeId}`).send({name: newName})
        expect(response.status).to.eql(400)

        // Check response
        expect(response.body).to.eql({error:'Cafe ID not found'})
      })
    })
  })
  describe('#deleteCafe', async () => {
    // Create a single cafe entry with an employee associated with it
    beforeEach(async () => {
      const newCafe = await db.Cafe.create({
        name: "Cafe 1",
        description: "cafe 1 description",
        location: "west"
      })

      // Create employee associated with cafe
      await db.Employee.create(testHelper.buildEmployee(
        newCafe.dataValues.id,
        new Date()
      ))
    })
    describe('When cafeId is valid', async () => {
      it('Should delete cafe and dissociate employees', async () => {
        // Get cafeId and employees associated with it
        const existingCafes = await db.Cafe.findAll()
        const existingCafeId = existingCafes[0].dataValues.id
        const employeesAssociatedWithCafe = await db.Employee.findAll({
          where: {cafeId: existingCafeId}
        })
        // Check that employee count is 1 before cafe is deleted
        expect(employeesAssociatedWithCafe.length).to.eql(1)

        // Send request
        const response = await request(app).delete(`/cafe/${existingCafeId}`)
        expect(response.status).to.eql(200)

        // Check that cafe was deleted
        const cafe = await db.Cafe.findByPk(existingCafeId)
        expect(cafe).to.eql(null)

        const employeesAssociatedWithCafeAfterDelete = await db.Employee.findAll({
          where: {cafeId: existingCafeId}
        })
        // Check that employee count is 0 after cafe is deleted
        expect(employeesAssociatedWithCafeAfterDelete.length).to.eql(0)
      })
    })
    describe('When cafeId is invalid', async () => {
      it('Should return an error', async () => {
        // Send request
        const wrongCafeId = '123'
        const response = await request(app).delete(`/cafe/${wrongCafeId}`)
   
        // Check response
        expect(response.status).to.eql(400)
        expect(response.body).to.eql({error:'Cafe ID not found'})
      })
    })
  })
});

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
        employees.push(testHelper.buildEmployee(
          cafe.dataValues.id,
          new Date()
        ))
        employees.push(testHelper.buildEmployee(
          cafe.dataValues.id,
          new Date()
        ))
        employees.push(testHelper.buildEmployee(
          cafe.dataValues.id,
          new Date()
        ))
      break;
      // Create 2 employees for cafes in the south
      case "south":
        employees.push(testHelper.buildEmployee(
          cafe.dataValues.id,
          new Date()
        ))
        employees.push(testHelper.buildEmployee(
          cafe.dataValues.id,
          new Date()
        ))
      break;
      // Create 1 employee for cafes in the east
      case "east":
        employees.push(testHelper.buildEmployee(
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