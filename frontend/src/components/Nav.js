import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import {Link} from "react-router-dom"

const pages = ['cafes', 'employees'];

const ResponsiveAppBar = () => {
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {pages.map((page) => (
            <Button
              key={page}
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              <Link style={{textDecoration: "none", color: "white"}} to={`/${page}`}>{page}</Link>
            </Button>
          ))}
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;
