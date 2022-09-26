const request = require('supertest');
const orderBy = require('lodash').orderBy;
const expect = require("chai").expect;

const app = require('../../app')
const db = require("../../models")
const testHelper = require("../testHelper.js")
const helper = require("../../helper.js")

const CAFE_1_NAME = 'Cafe 1'
const CAFE_2_NAME = 'Cafe 2'
const CAFE_1_EMPLOYEE_DAYS_WORKED = 20
const CAFE_2_EMPLOYEE_DAYS_WORKED = 10
const NO_CAFE_EMPLOYEE_DAYS_WORKED = 1

const seedCafesAndEmployees = async () => {
  // Create 2 cafes
  const cafe1 = await db.Cafe.create({
    name: CAFE_1_NAME,
    description: "description",
    location: "west",
  })
  const cafe2 = await db.Cafe.create({
    name: CAFE_2_NAME,
    description: "description",
    location: "west",
  })

  // Create 1 employees per cafe and 1 employees who doesnt work in a cafe
  const employees = []
  // Cafe 1 employee
  employees.push(testHelper.buildEmployee(
    cafe1.dataValues.id,
    helper.getDateXDaysAgo(CAFE_1_EMPLOYEE_DAYS_WORKED)
  ))
  // Cafe 2 employee
  employees.push(testHelper.buildEmployee(
    cafe2.dataValues.id,
    helper.getDateXDaysAgo(CAFE_2_EMPLOYEE_DAYS_WORKED)
  ))
  // Employee with no cafe
  employees.push(testHelper.buildEmployee(
    null,
    helper.getDateXDaysAgo(NO_CAFE_EMPLOYEE_DAYS_WORKED)
  ))
  await db.Employee.bulkCreate(employees)
}

describe('Employee controller', async () => {
  beforeEach(async () => {
    await testHelper.clearDB()
  })
  describe('#listEmployees', async () => {
    beforeEach(async () => {
      await seedCafesAndEmployees()
    });
    describe('when cafeId not provided', async () => {
      it('Should return all employees in descending order of days worked', async () => {
        // Get response
        const response = await request(app).get('/api/employees')
        expect(response.status).to.eql(200)

        // Get cafes
        const cafe1 = await db.Cafe.findOne({where: {name: CAFE_1_NAME}})
        const cafe2 = await db.Cafe.findOne({where: {name: CAFE_2_NAME}})

        const employeeAtCafe1 = await db.Employee.findOne({where: {cafeId: cafe1.id}})
        const employeeAtCafe2 = await db.Employee.findOne({where: {cafeId: cafe2.id}})
        const employeeWithNoCafe = await db.Employee.findOne({where: {cafeId: null}})
        
        // Configure expected response
        const expectedResponse = [{
          ...testHelper.templateEmployee,
          daysWorked: 20,
          cafe: cafe1.name,
          id: employeeAtCafe1.id,
          cafeId: cafe1.id
        },
        {
          ...testHelper.templateEmployee,
          daysWorked: 10,
          cafe: cafe2.name,
          id: employeeAtCafe2.id,
          cafeId: cafe2.id
        },
        {
          ...testHelper.templateEmployee,
          daysWorked: 1,
          cafe: "",
          id: employeeWithNoCafe.id,
          cafeId: ""
        }]
        expect(response.body).to.eql(expectedResponse)
      })
    });
    describe('when cafeId provided', async () => {
      it('Should return employees working in cafe', async () => {
        // Get cafe1
        const cafe1 = await db.Cafe.findOne({where: {name: CAFE_1_NAME}})

        const employeeAtCafe1 = await db.Employee.findOne({where: {cafeId: cafe1.id}})

        // Get response
        const response = await request(app).get(`/api/employees?cafe=${cafe1.id}`)
        expect(response.status).to.eql(200)
        
        // Configure expected response
        const expectedResponse = [{
          ...testHelper.templateEmployee,
          daysWorked: 20,
          cafe: cafe1.name,
          cafeId: cafe1.id,
          id: employeeAtCafe1.id
        }]
        expect(response.body).to.eql(expectedResponse)
      })
    });
    describe('when invalid cafeId provided', function() {
      it('Should send back an empty list', async () => {
        // Get response
        const response = await request(app).get('/api/employees?cafe=invalid')
        expect(response.status).to.eql(200)

        // Configure expected response
        const expectedResponse = []
        expect(response.body).to.eql(expectedResponse)
      })
    });
  })
  describe('#createEmployees', async () => {
    describe('When required params are present and with no cafeID', async () => {
      it('Should create 1 new employee', async () => {
        // Send request
        const response = await request(app).post('/api/employee').send(testHelper.templateEmployee)
        expect(response.status).to.eql(200)

        // 1 employee created
        const employees = await db.Employee.findAll()
        expect(employees.length).to.eql(1)
      })
    })
    describe('When required params ie name is not present', async () => {
      it('Should not create a new employee', async () => {
        // Send request
        const response = await request(app).post('/api/employee').send({
          emailAddress: testHelper.templateEmployee.emailAddress,
          phoneNumber: testHelper.templateEmployee.phoneNumber,
          gender: testHelper.templateEmployee.gender,
        })

        // Returns validation error
        expect(response.status).to.eql(400)
        expect(response.body).to.eql({ name: 'Employee.name cannot be null' })

        // 0 employee created
        const employees = await db.Employee.findAll()
        expect(employees.length).to.eql(0)
      })
    })
    describe('When required params and cafeID are present', async () => {
      it('Should create 1 new employee and associate with cafe', async () => {
        // Create cafe
        const cafe = await db.Cafe.create({
          name: CAFE_1_NAME,
          description: "description",
          location: "west",
        })

        // Send request
        const response = await request(app).post('/api/employee').send({
          ...testHelper.templateEmployee,
          cafeId: cafe.dataValues.id
        })
        expect(response.status).to.eql(200)

        // 1 employee created with association to cafe
        const employees = await db.Employee.findAll()
        expect(employees.length).to.eql(1)
        expect(employees[0].dataValues.cafeId).to.eq(cafe.dataValues.id)
        expect(employees[0].dataValues.startDateAtCafe).to.not.eql(null)
      })
    })
    describe('When required params are present and cafeID is not valid', async () => {
      it('Should not create a new employee', async () => {
        // Send request
        const response = await request(app).post('/api/employee').send({
          ...testHelper.templateEmployee,
          cafeId: 'invalid'
        })

        // Returns validation error
        expect(response.status).to.eql(400)
        expect(response.body).to.eql({ error: 'Invalid cafe ID' })

        // 0 employees created
        const employees = await db.Employee.findAll()
        expect(employees.length).to.eql(0)
      })
    })
  })
  describe('#updateEmployees', async () => {
    // Create a single employee entry
    beforeEach(async () => {
      await db.Employee.create(testHelper.templateEmployee)
    })
    describe('When employeeId is valid', async () => {
      it('Should update employee with new values', async () => {
        // Get employeeId
        const existingEmployees = await db.Employee.findAll()
        const existingEmployeeId = existingEmployees[0].dataValues.id

        // Send request
        const newName = "Employee 2"
        const response = await request(app).put(`/api/employee/${existingEmployeeId}`).send({name: newName})
        expect(response.status).to.eql(200)

        // Check that name was updated
        const employee = await db.Employee.findByPk(existingEmployeeId)
        expect(employee.name).to.eql(newName)
      })
    })
    describe('When employeeId is invalid', async () => {
      it('Should return an error', async () => {
        // Send request
        const newName = "Employee 2"
        const wrongEmployeeId = 100000
        const response = await request(app).put(`/api/employee/${wrongEmployeeId}`).send({name: newName})
        expect(response.status).to.eql(400)

        // Check response
        expect(response.body).to.eql({error:'Employee ID not found'})
      })
    })

    describe('When cafeId is invalid', async () => {
      it('Should return an error', async () => {
        // Get employeeId
        const existingEmployees = await db.Employee.findAll()
        const existingEmployeeId = existingEmployees[0].dataValues.id

        // Send request
        const newName = "Employee 2"
        const wrongEmployeeId = 100000
        const response = await request(app).put(`/api/employee/${existingEmployeeId}`).send({
          name: newName,
          cafeId: "invalid"
        })
        expect(response.status).to.eql(400)

        // Check response
        expect(response.body).to.eql({error:'Invalid cafe ID'})
      })
    })

    describe('When new cafeId is valid', async () => {
      it('Should update employee with new cafeId', async () => {
        // Get employeeId
        const existingEmployees = await db.Employee.findAll()
        const existingEmployeeId = existingEmployees[0].dataValues.id

        // Create new cafe
        const newCafe = await db.Cafe.create({
          name: CAFE_1_NAME,
          description: "description",
          location: "west",
        })

        // Send request
        const response = await request(app).put(`/api/employee/${existingEmployeeId}`).send({cafeId: newCafe.dataValues.id})
        expect(response.status).to.eql(200)

        // Check that cafeId was updated
        const employee = await db.Employee.findByPk(existingEmployeeId)
        expect(employee.cafeId).to.eql(newCafe.id)
      })
    })
  })
  describe('#deleteEmployees', async () => {
    // Create a single employee entry
    beforeEach(async () => {
      await db.Employee.create(testHelper.templateEmployee)
    })

    describe('When employeeId is valid', async () => {
      it('Should delete employee', async () => {
        // Get employeeId
        const existingEmployees = await db.Employee.findAll()
        const existingEmployeeId = existingEmployees[0].dataValues.id

        // Check that existing employee count is 1
        expect(existingEmployees.length).to.eql(1)

        // Send request
        const response = await request(app).delete(`/api/employee/${existingEmployeeId}`)
        expect(response.status).to.eql(200)

        // Check employee count 1 0
        const employeesAfterDelete = await db.Employee.findAll()
        expect(employeesAfterDelete.length).to.eql(0)
      })
    })
    describe('When employeeId is invalid', async () => {
      it('Should return an error', async () => {
        // Send request
        const wrongEmployeeId = 100000
        const response = await request(app).delete(`/api/employee/${wrongEmployeeId}`)
        
        // Check response
        expect(response.status).to.eql(400)
        expect(response.body).to.eql({error:'Employee ID not found'})
      })
    })

  })
});