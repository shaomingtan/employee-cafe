import { Link, useLocation } from "react-router-dom";
import {
  Grid,
  Typography,
  TextField,
  Select,
  Box,
  Button,
  InputLabel,
  MenuItem,
  FormControl
} from "@material-ui/core";
import React, { useState, useEffect } from "react";

import { createEmployee, updateEmployee, getCafes } from "../apis/dataApi"
import store from "../ReduxStore";

const NEW_EMPLOYEE = {
  name: '',
  emailAddress: '',
  phoneNumber: '',
  gender: '',
  cafeId: ''
}

const EmployeeForm = (props) => {
  const [employee, setEmployee] = useState(NEW_EMPLOYEE);
  const [cafeOption, setCafeOption] = useState([]);

  // Get employee data from location state
  const location = useLocation()
  const data = location.state
  
  // Fetch Cafes to populate cafe select component
  useEffect(() => {
    (async () => {
      const cafesResponse = await getCafes();
      if (cafesResponse && cafesResponse.length > 0){
        const parsedCafes = cafesResponse.map((cafe) => ({
          id: cafe.id,
          name: cafe.name
        }))
        setCafeOption(parsedCafes)
      }

    })()
  },[])

  // Set employee
  useEffect(() => {
    if (data) {
      setEmployee(data)
      console.log("data", data)
    }
  },[data])

  const saveEmployee = async () => {
    if (employee.id) {
      await updateEmployee(employee.id, {
        name: employee.name,
        emailAddress: employee.emailAddress,
        phoneNumber: employee.phoneNumber,
        gender: employee.gender,
        cafeId: employee.cafeId,
      })
      store.dispatch({ type: "showMessage", payload: "Employee Updated." });
    } else {
      await createEmployee({
        name: employee.name,
        emailAddress: employee.emailAddress,
        phoneNumber: employee.phoneNumber,
        gender: employee.gender,
        cafeId: employee.cafeId,
      })
      store.dispatch({ type: "showMessage", payload: "Employee Created." });
    }
  // TODO Display to user that employee has been updated
  }

  return (
    <Box sx={{
      margin:'1rem',
    }}>
      <Typography variant="h5" gutterBottom>{employee.name}</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <TextField
            required
            id="name"
            name="name"
            label="Name"
            fullWidth
            variant="standard"
            value={employee.name}
            onChange={(e) => {
              setEmployee({
                ...employee,
                name: e.target.value,
              });
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            required
            id="emailAddress"
            name="emailAddress"
            label="Email"
            fullWidth
            variant="standard"
            value={employee.emailAddress}
            onChange={(e) => {
              setEmployee({
                ...employee,
                emailAddress: e.target.value,
              });
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            required
            id="phoneNumber"
            name="phoneNumber"
            label="Phone"
            fullWidth
            variant="standard"
            value={employee.phoneNumber}
            onChange={(e) => {
              setEmployee({
                ...employee,
                phoneNumber: e.target.value,
              });
            }}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth>
            <InputLabel id="gender-label-id">Gender</InputLabel>
            <Select
              labelId="gender-label-id"
              id="gender"
              value={employee.gender}
              label="Gender"
              onChange={(e) => {
                setEmployee({
                  ...employee,
                  gender: e.target.value,
                });
              }}
            >
              <MenuItem value={'female'}>Female</MenuItem>
              <MenuItem value={'male'}>Male</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth>
            <InputLabel id="cafe-label-id">Cafe</InputLabel>
            <Select
              labelId="cafe-label-id"
              id="cafe"
              value={employee.cafeId}
              label="Cafe"
              onChange={(e) => {
                setEmployee({
                  ...employee,
                  cafeId: e.target.value,
                });
              }}
            >
              {cafeOption && cafeOption.map((item) => {
                return (
                  <MenuItem id={item.id} value={item.id}>{item.name}</MenuItem>    
                )
              })}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Button 
        variant="contained" 
        color="primary"
        onClick={saveEmployee}
      >
        Save
      </Button>
      <Link 
        style={{textDecoration: "none"}} 
        to={'/employees'}
      >  
        <Button variant="outlined" color="primary">
          Cancel
        </Button>
      </Link>
    </Box>
  );
};

export default EmployeeForm
