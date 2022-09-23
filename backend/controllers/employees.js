const db = require("../models")

const employee = {
  listEmployees: async (req,res) => {
    // If no cafeId provided, return all employees with a limit of 100.
    // TODO: Add pagination logic
    if (!req.query.cafe) {
      const [employees, metadata] = await db.sequelize.query(`
        SELECT 
          employees.id, 
          employees.name, 
          employees.emailAddress, 
          employees.phoneNumber, 
          employees.gender, 
          IFNULL(employees.cafeId,'') as cafeId,
          IFNULL(cafes.name,'') as cafe,
          ROUND(
            JULIANDAY('now') - JULIANDAY(employees.startDateAtCafe)
          ) as daysWorked 
        FROM 
          employees 
          LEFT JOIN cafes ON employees.cafeId=cafes.id
        ORDER BY 
          daysWorked DESC 
        limit 
          100    
      `)
      return res.send(employees)
    }

    const cafe = await db.Cafe.findByPk(req.query.cafe)
    // If cafeId is invalid, return empty array
    if (!cafe) {
      return res.send([])
    }

    // If cafeId present, return employees who works at the cafe
    const [employeesFromCafe, metadata] = await db.sequelize.query(`
      SELECT 
        employees.id, 
        employees.name, 
        employees.emailAddress, 
        employees.phoneNumber, 
        employees.gender, 
        employees.cafeId, 
        IFNULL(employees.cafeId,'') as cafeId,
        IFNULL(cafes.name,'') as cafe,
        ROUND(
          JULIANDAY('now') - JULIANDAY(employees.startDateAtCafe)
        ) as daysWorked 
      FROM 
        employees 
        LEFT JOIN cafes ON employees.cafeId=cafes.id
      WHERE 
        employees.cafeId=:cafeId 
      ORDER BY 
        daysWorked DESC
    `, {
      replacements: {cafeId: cafe.id}
    })
    return res.send(employeesFromCafe)
  },
  createEmployee: async (req,res) => {
    // Build employee
    const employee = await db.Employee.build({
      name: req.body.name,
      emailAddress: req.body.emailAddress,
      phoneNumber: req.body.phoneNumber,
      gender: req.body.gender,
    });

    // validate cafe
    if (req.body.cafeId) {
      const cafe = await db.Cafe.findByPk(req.body.cafeId)
      if (!cafe) {
        res.status(400)
        return res.send({error: "Invalid cafe ID"})
      }

      // Assuming here that date employee was created with a cafeId is the date that they joined the cafe
      employee.cafeId = cafe.id
      employee.startDateAtCafe = new Date()
    }

    // Validate and create employee
    try {
      await employee.save()
      res.send(employee)
    } catch (e) {
      res.status(400)
      if (e.name === 'SequelizeValidationError') {
        const errObj = {};
        e.errors.map( err => {
          errObj[err.path] = err.message;
      })
      return res.send(errObj)
      }
      console.log("createEmployee error", e)
      return res.send({error: "There was an error creating the employee"})
    }
  },
  updateEmployee: async (req,res) => {
    // Find employee
    const employeeId = req.params.employee_id
    const employee = await db.Employee.findByPk(employeeId)

    if (!employee) {
      res.status(400)
      res.send({error:"Employee ID not found"})
      return
    }

    // validate cafe
    if (req.body.cafeId) {
      const cafe = await db.Cafe.findByPk(req.body.cafeId)
      if (!cafe) {
        res.status(400)
        return res.send({error: "Invalid cafe ID"})
      }

      // Assuming here that a change in cafeId for employee means that they joined a new cafe
      if (cafe.id != employee.cafeId) {
        employee.cafeId = cafe.id
        employee.startDateAtCafe = new Date()
      }
    }

    // Validate and update employee
    try {
      // Set params
      employee.name = req.body.name ? req.body.name : employee.name
      employee.emailAddress = req.body.emailAddress? req.body.emailAddress : employee.emailAddress
      employee.phoneNumber = req.body.phoneNumber? req.body.phoneNumber : employee.phoneNumber
      employee.gender = req.body.gender? req.body.gender : employee.gender
      const result = employee.save()
      
      res.send(result)
    } catch (e) {
      res.status(400)
      if (e.name === 'SequelizeValidationError') {
        const errObj = {};
        e.errors.map( err => {
          errObj[err.path] = err.message;
       })
       return res.send(errObj)
      }
      console.log("updateEmployee error", e)
      return res.send({error:"There was an error updating the employee"})
    }
  },
  deleteEmployee: async (req,res) => {
    // Find employee
    const employeeId = req.params.employee_id
    const employee = await db.Employee.findByPk(employeeId)

    if (!employee) {
      res.status(400)
      res.send({error:"Employee ID not found"})
      return
    }

    // Destroy employee
    try {
      await employee.destroy();
      res.send("Successfully deleted employee")
    } catch (e) {
      res.status(400)
      console.log("deleteEmployee error", e)
      return res.send({error: "There was an error deleting the employee"})
    }
  }
}

module.exports = {
  employee
} 