const db = require("../models")

const templateEmployee = {
  name: `Sam Lim`,
  emailAddress: `sam_lim@gic.com`,
  phoneNumber: `99990000`,
  gender: 'female'
}
const buildEmployee = (cafeId=null,startDateAtCafe=null) => ({
  ...templateEmployee,
  startDateAtCafe,
  cafeId
})

const clearDB = async () => {
  await db.Employee.destroy({
    where: {},
    truncate: true
  })
  await db.Cafe.destroy({
    where: {},
    truncate: true
  })
}

module.exports = {
  templateEmployee,
  buildEmployee,
  clearDB,
} 