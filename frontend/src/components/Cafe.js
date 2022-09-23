import {Link} from "react-router-dom"
import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
} from "@material-ui/core";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { getCafes, deleteCafe } from "../apis/dataApi" 
import EditDeleteBtnCellRenderer from './EditDeleteBtnCellRenderer';
import DeletePopUp from './DeletePopUp';

const Cafe = () => {
  const [rowData, setRowData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [cafeToDelete, setCafeToDelete] = useState(null);

  // Setup table columns
  const defaultColDef = { resizable: true };
  const columnDefs = [
    {field: 'id', width: 350},
    {field: 'name'},
    {field: 'description'},
    {field: 'employees'},
    {
      field: 'location', 
      filter:'agSetColumnFilter',
    },
    {
      field: 'Action',
      cellRenderer: EditDeleteBtnCellRenderer,
      cellRendererParams: {
        linkType: 'cafes',
        editTitle: 'Edit',
        deleteTitle: 'Delete',
        onClickDelete: (cafe) => () => {
          setCafeToDelete(cafe)
          setOpenDialog(true)
        }
      }
    }
  ]

  // Fetch and set table row data
  const fetchCafesAndUpdateTable = async () => {
    const cafesResponse = await getCafes();

    if (cafesResponse && cafesResponse.length > 0){
      const parsedCafes = cafesResponse.map((cafe) => ({
        id: cafe.id,
        name: cafe.name,
        description: cafe.description,
        location: cafe.location,
        employees: cafe.employees,
      }))
      setRowData(parsedCafes)
    }
  }

  const onGridReady = async () => {
    fetchCafesAndUpdateTable()
  }

  const deleteSelectedCafe = async () => {
    if (cafeToDelete) {
      await deleteCafe(cafeToDelete.id)
      setOpenDialog(false)
      fetchCafesAndUpdateTable()
      // TODO Display to user that cafe has been deleted
    }
  }

  return (
    <>
      <DeletePopUp 
        openDialog={openDialog} 
        handleCancel={()=>{setOpenDialog(false)}}
        handleConfirm={deleteSelectedCafe}
        deleteItemName={cafeToDelete ? cafeToDelete.name : ''}
      />
      <Box sx={{marginTop:"0.5rem", marginBottom:"0.5rem"}}>
        <Typography variant="h5" gutterBottom>Cafes</Typography>
        <Link
          style={{textDecoration: "none", color: "black"}} 
          to={`/cafes/new`}
        >
          <Button 
            variant="outlined"
            color="primary"
          >
            Add Cafe
          </Button>
        </Link>
      </Box>
      <Box sx={{padding:'1rem'}}>
        <div className="ag-theme-alpine" style={{height: 600, width: 'auto'}}>
          <AgGridReact
            rowData={rowData}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            columnDefs={columnDefs}>
          </AgGridReact>
        </div>
      </Box>
    </>
  );
}

export default Cafe;
