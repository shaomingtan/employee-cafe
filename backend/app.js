const express = require("express")
const path = require('path');

const controllers = require("./controllers")

const app = express();
app.use(express.json())

if (process.env.NODE_ENV === 'development') {
    console.log("Loading backend with CORS for dev environment")
    var cors = require('cors')
    app.use(cors())
}


app.get('/api/cafes', controllers.cafe.listCafes)
app.post('/api/cafe', controllers.cafe.createCafe)
app.put('/api/cafe/:cafe_id', controllers.cafe.updateCafe)
app.delete('/api/cafe/:cafe_id', controllers.cafe.deleteCafe)

app.get('/api/employees', controllers.employee.listEmployees)
app.post('/api/employee', controllers.employee.createEmployee)
app.put('/api/employee/:employee_id', controllers.employee.updateEmployee)
app.delete('/api/employee/:employee_id', controllers.employee.deleteEmployee)

//Serve the static files from the React app
app.use(express.static(path.join(__dirname, '/static')));
// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    console.log(res);
    res.sendFile(path.join(__dirname+'/static/index.html'));
});

module.exports = app;