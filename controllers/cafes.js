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
      // If location invalid return null
      case VALIDATE_LOCATIONS_STATES.INVALID_LOCATION:
      default:{
        return res.send([])
      }
    }
  },
  createCafe: async (req,res) => {
    return res.send([])
  },
  updateCafe: async (req,res) => {
    return res.send([])
  },
  deleteCafe: async (req,res) => {
    return res.send([])
  }
}

module.exports = {
  cafe
} 