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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

import { createEmployee, updateEmployee, getCafes } from "../apis/dataApi"
import store from "../ReduxStore";

const NEW_EMPLOYEE = {
  name: '',
  emailAddress: '',
  phoneNumber: '',
  gender: 'female',
  cafeId: ''
}

const EmployeeForm = (props) => {
  const [employee, setEmployee] = useState(NEW_EMPLOYEE);
  const [cafeOption, setCafeOption] = useState([]);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required').min(6).max(10),
    emailAddress: Yup.string().required('Email is required').email(),
    phoneNumber: Yup.string().required('Phone Number is required').test({
      name: 'is-phoneNumber',
      skipAbsent: true,
      test(value, ctx) {
        if (!(/^(8|9)\d{7}/g.test(value))) {
          return ctx.createError({ message: 'phoneNumber should begin with 8 or 9 and contain 8 digits.' })
        }
        return true
      }
    }),
  });

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(validationSchema)
  });

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
      reset(data);
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
            {...register('name')}
            error={errors.name ? true : false}
            onChange={(e) => {
              setEmployee({
                ...employee,
                name: e.target.value,
              });
            }}
          />
          <Typography variant="inherit" color="textSecondary">
            {errors.name?.message}
          </Typography>
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
            {...register('emailAddress')}
            error={errors.emailAddress ? true : false}
            onChange={(e) => {
              setEmployee({
                ...employee,
                emailAddress: e.target.value,
              });
            }}
          />
          <Typography variant="inherit" color="textSecondary">
            {errors.emailAddress?.message}
          </Typography>
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
            {...register('phoneNumber')}
            error={errors.phoneNumber ? true : false}
            onChange={(e) => {
              setEmployee({
                ...employee,
                phoneNumber: e.target.value,
              });
            }}
          />
          <Typography variant="inherit" color="textSecondary">
            {errors.phoneNumber?.message}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={2}>
          <FormControl fullWidth>
            <FormLabel id="gender-label-id">Gender</FormLabel>
            <RadioGroup
              row
              aria-labelledby="gender-label-id"
              name="gender"
              value={employee.gender}
              onChange={(e) => {
                setEmployee({
                  ...employee,
                  gender: e.target.value,
                });
              }}
            >
              <FormControlLabel value="female" control={<Radio />} label="Female" />
              <FormControlLabel value="male" control={<Radio />} label="Male" />
            </RadioGroup>
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
                  <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>    
                )
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSubmit(saveEmployee)}
            style={{marginRight:'1rem'}}
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
        </Grid>
      </Grid>

    </Box>
  );
};

export default EmployeeForm
