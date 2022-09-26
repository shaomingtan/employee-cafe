import { Link, useLocation } from "react-router-dom";
import {
  Grid,
  Typography,
  TextField,
  Box,
  Button
} from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

import { createCafe, updateCafe } from "../apis/dataApi"
import store from "../ReduxStore";

const NEW_CAFE = {
  name: '',
  description: '',
  location: ''
}

const CafeForm = (props) => {
  const [cafe, setCafe] = useState(NEW_CAFE);

  // Get cafe data from location state
  const location = useLocation()
  const data = location.state
  
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required').min(6).max(10),
    description: Yup.string().required('Description is required').max(256),
  });

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(validationSchema)
  });

  // Set cafe
  useEffect(() => {
    if (data) {
      setCafe(data)
      reset(data)
    }
  },[data])

  const saveCafe = async (data) => {
    if (cafe.id) {
      await updateCafe(cafe.id, {
        name: cafe.name,
        description: cafe.description,
        location: cafe.location,
      })
      store.dispatch({ type: "showMessage", payload: "Cafe Updated." });
    } else {
      await createCafe({
        name: cafe.name,
        description: cafe.description,
        location: cafe.location,
      })
      store.dispatch({ type: "showMessage", payload: "Cafe Created." });
    }
  }

  return (
    <Box sx={{
      margin:'1rem',
    }}>
      <Typography variant="h5" gutterBottom>{cafe.name}</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="name"
            name="name"
            label="Name"
            fullWidth
            variant="standard"
            value={cafe.name}
            {...register('name')}
            error={errors.name ? true : false}
            onChange={(e) => {
              setCafe({
                ...cafe,
                name: e.target.value,
              });
            }}
          />
          <Typography variant="inherit" color="textSecondary">
            {errors.name?.message}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            id="location"
            name="location"
            label="Location"
            fullWidth
            variant="standard"
            value={cafe.location}
            onChange={(e) => {
              setCafe({
                ...cafe,
                location: e.target.value,
              });
            }}
          />
        </Grid>
        <Grid item xs={12}>
        <TextField
            required
            id="description"
            name="description"
            label="Description"
            fullWidth
            variant="standard"
            value={cafe.description}
            {...register('description')}
            error={errors.description ? true : false}
            onChange={(e) => {
              setCafe({
                ...cafe,
                description: e.target.value,
              });
            }}
          />
          <Typography variant="inherit" color="textSecondary">
            {errors.description?.message}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSubmit(saveCafe)}
            style={{marginRight:'1rem'}}
          >
            Save
          </Button>
          <Link 
            style={{textDecoration: "none"}} 
            to={'/cafes'}
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

export default CafeForm
