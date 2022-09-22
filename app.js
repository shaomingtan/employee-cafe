const express = require("express")
const controllers = require("./controllers")

const app = express();
app.use(express.json())

app.get('/cafes', controllers.cafe.listCafes)
app.post('/cafe', controllers.cafe.createCafe)
app.put('/cafe/:cafe_id', controllers.cafe.updateCafe)
app.delete('/cafe/:cafe_id', controllers.cafe.deleteCafe)

app.get('/employees', controllers.employee.listEmployees)
app.post('/employee', controllers.employee.createEmployee)
app.put('/employee/:employee_id', controllers.employee.updateEmployee)
app.delete('/employee/:employee_id', controllers.employee.deleteEmployee)

module.exports = app;