import { Link, useLocation } from "react-router-dom";
import {
  Grid,
  Typography,
  TextField,
  Box,
  Button
} from "@material-ui/core";
import React, { useState, useEffect } from "react";

import { createCafe, updateCafe } from "../apis/dataApi"

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
  
  // Set cafe
  useEffect(() => {
    if (data) {
      setCafe(data)
    }
  },[data])

  const saveCafe = async () => {
    if (cafe.id) {
      await updateCafe(cafe.id, {
        name: cafe.name,
        description: cafe.description,
        location: cafe.location,
      })
    } else {
      await createCafe({
        name: cafe.name,
        description: cafe.description,
        location: cafe.location,
      })
    }
  // TODO Display to user that cafe has been updated
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
            onChange={(e) => {
              setCafe({
                ...cafe,
                name: e.target.value,
              });
            }}
          />
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
            onChange={(e) => {
              setCafe({
                ...cafe,
                description: e.target.value,
              });
            }}
          />
        </Grid>
      </Grid>

      <Button 
        variant="contained" 
        color="primary"
        onClick={saveCafe}
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
    </Box>
  );
};

export default CafeForm
