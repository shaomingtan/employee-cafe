const db = require("../models")

const VALID_LOCATIONS = ["north", "south", "east", "west"]
const VALIDATE_LOCATIONS_STATES = {
  NO_LOCATION: "NO_LOCATION",
  VALID_LOCATION: "VALID_LOCATION",
  INVALID_LOCATION: "INVALID_LOCATION",
}

const isValidLocation = (location) => VALID_LOCATIONS.includes(location.toLowerCase())

const validateLocation = query => {
  if (!query || !query.location){
    return VALIDATE_LOCATIONS_STATES.NO_LOCATION
  }

  if (isValidLocation(query.location)){
    return VALIDATE_LOCATIONS_STATES.VALID_LOCATION
  }

  return VALIDATE_LOCATIONS_STATES.INVALID_LOCATION
}

const cafe = {
  listCafes: async (req,res) => {
    const validateLocationState = validateLocation(req.query)
    
    switch(validateLocationState){
      case VALIDATE_LOCATIONS_STATES.NO_LOCATION: {
        // If no location provided, List all cafes
        const [cafes, metadata] = await db.sequelize.query(`
          SELECT 
            cafes.id, 
            cafes.name, 
            cafes.description, 
            cafes.logo, 
            cafes.location, 
            IFNULL(ec.count,0) as employees
          FROM 
            cafes 
            LEFT JOIN (
              SELECT 
                COUNT(employees.id) AS count, 
                cafeId 
              FROM 
                employees 
              GROUP BY 
                employees.cafeId
            ) AS ec ON cafes.id = ec.cafeId 
          ORDER BY 
            ec.count DESC
        `)
        return res.send(cafes)
      }
      case VALIDATE_LOCATIONS_STATES.VALID_LOCATION: {
        // If location provided, List cafes in the location
        const [cafes, metadata] = await db.sequelize.query(`
          SELECT 
            cafes.id, 
            cafes.name, 
            cafes.description, 
            cafes.logo, 
            cafes.location, 
            IFNULL(ec.count, 0) as employees 
          FROM 
            cafes 
            LEFT JOIN (
              SELECT 
                COUNT(employees.id) AS count, 
                cafeId 
              FROM 
                employees 
              GROUP BY 
                employees.cafeId
            ) AS ec ON cafes.id = ec.cafeId 
          WHERE 
            cafes.location =:location 
          ORDER BY 
            ec.count DESC
        `, {
          replacements: {location: req.query.location}
        })
        return res.send(cafes)
      }
      // If location invalid return empty array
      case VALIDATE_LOCATIONS_STATES.INVALID_LOCATION:
      default:{
        return res.send([])
      }
    }
  },
  createCafe: async (req,res) => {
    // Validate and create cafe
    try {
      const cafe = await db.Cafe.create({
        name: req.body.name,
        description: req.body.description,
        logo: req.body.logo,
        location: req.body.location
      });
      res.send(cafe)
    } catch (e) {
      res.status(400)
      if (e.name === 'SequelizeValidationError') {
        const errObj = {};
        e.errors.map( err => {
          errObj[err.path] = err.message;
       })
       return res.send(errObj)
      }
      console.log("createCafe error", e)
      return res.send({error:"There was an error creating the cafe"})
    }
  },
  updateCafe: async (req,res) => {
    // Find cafe
    const cafeId = req.params.cafe_id
    const cafe = await db.Cafe.findByPk(cafeId)

    if (!cafe) {
      res.status(400)
      res.send({error:"Cafe ID not found"})
      return
    }

    // Validate and update cafe
    try {
      // Set params
      // TODO add tests to validate that 
      cafe.name = req.body.name ? req.body.name : cafe.name
      cafe.description = req.body.description ? req.body.description : cafe.description
      cafe.logo = req.body.logo ? req.body.logo : cafe.logo
      cafe.location = req.body.location ? req.body.location : cafe.location
      const result = await cafe.save()
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
      console.log("updateCafe error", e)
      return res.send({error:"There was an error updating the cafe"})
    }
  },
  deleteCafe: async (req,res) => {
    // TODO, DRY up find cafe logic up and share with updateCafe
    // Find cafe
    const cafeId = req.params.cafe_id
    const cafe = await db.Cafe.findByPk(cafeId)

    if (!cafe) {
      res.status(400)
      res.send({error:"Cafe ID not found"})
      return
    }

    // Find employees associated with cafe so that we can dissociate them.
    const employeesToDissociate = []
    const employeesWorkingInCafe = await db.Employee.findAll({where: {cafeId: cafeId}})
    employeesWorkingInCafe.map(employee => {
      employeesToDissociate.push({
        ...employee.dataValues,
        cafeId: null,
        startDateAtCafe: null
      })
    })

    // Destroy cafe and dissociate employees from cafe
    try {
      await db.sequelize.transaction(async (t) => {
        // Note that bulkCreate can be used for bulk updating by setting the updateOnDuplicate option. I referenced this article: https://sebhastian.com/sequelize-bulk-update/
        await db.Employee.bulkCreate(employeesToDissociate, { 
          updateOnDuplicate: ["cafeId", "startDateAtCafe"],
          transaction: t 
        })
        console.log("removed employee association with cafe")
        await cafe.destroy({ transaction: t });
      })
      res.send("Successfully deleted cafe")
    } catch (e) {
      res.status(400)
      console.log("deleteCafe error", e)
      return res.send({error: "There was an error deleting the cafe"})
    }
  }
}

module.exports = {
  cafe
} 