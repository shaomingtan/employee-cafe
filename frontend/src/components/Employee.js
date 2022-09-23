import { Link, useSearchParams } from "react-router-dom"
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
} from "@material-ui/core";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { getEmployees, deleteEmployee } from "../apis/dataApi" 
import EditDeleteBtnCellRenderer from './EditDeleteBtnCellRenderer';
import DeletePopUp from './DeletePopUp';
import store from "../ReduxStore";

const Employee = () => {
  const [rowData, setRowData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [selectedCafe, setSelectedCafe] = useState('');

  // Retrieve cafeId from url params
  const [searchParams, setSearchParams] = useSearchParams();
  const cafeId = searchParams.get('cafeId')
  // Update selected cafe
  useEffect(() => {
    if (cafeId) {
      setSelectedCafe(cafeId)
      fetchEmployeesAndUpdateTable()
    }
  },[cafeId])

  // Setup table columns
  const defaultColDef = { resizable: true };
  const columnDefs = [
    {field: 'name'},
    {field: 'emailAddress', width: 250},
    {field: 'phoneNumber'},
    {field: 'gender', width: 150},
    {field: 'cafe'},
    {field: 'daysWorked'},
    {
      field: 'Action',
      cellRenderer: EditDeleteBtnCellRenderer,
      cellRendererParams: {
        linkType: 'employees',
        editTitle: 'Edit',
        deleteTitle: 'Delete',
        onClickDelete: (employee) => () => {
          setEmployeeToDelete(employee)
          setOpenDialog(true)
        }
      }
    }
  ]

  // Fetch and set table row data
  const fetchEmployeesAndUpdateTable = async () => {
    const employeesResponse = await getEmployees(selectedCafe);

    if (employeesResponse && employeesResponse.length > 0){
      const parsedEmployees = employeesResponse.map((employee) => ({
        id: employee.id,
        name: employee.name,
        emailAddress: employee.emailAddress,
        phoneNumber: employee.phoneNumber,
        gender: employee.gender,
        cafe: employee.cafe,
        daysWorked: employee.daysWorked,
        cafeId: employee.cafeId,
      }))
      setRowData(parsedEmployees)
    }
  }

  const onGridReady = async () => {
    fetchEmployeesAndUpdateTable()
  }

  const deleteSelectedEmployee = async () => {
    if (employeeToDelete) {
      await deleteEmployee(employeeToDelete.id)
      setOpenDialog(false)
      fetchEmployeesAndUpdateTable()
      store.dispatch({ type: "showMessage", payload: "Employee Deleted." });
    }
  }

  return (
    <>
      <DeletePopUp 
        openDialog={openDialog} 
        handleCancel={()=>{setOpenDialog(false)}}
        handleConfirm={deleteSelectedEmployee}
        deleteItemName={employeeToDelete ? employeeToDelete.name : ''}
      />
      <Box sx={{marginTop:"0.5rem", marginBottom:"0.5rem"}}>
        <Typography variant="h5" gutterBottom>Employees {selectedCafe ? `working at ${selectedCafe}`: ''}</Typography>
        <Link
          style={{textDecoration: "none", color: "black"}} 
          to={`/employees/new`}
        >
          <Button 
            variant="outlined"
            color="primary"
          >
            Add Employee
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

export default Employee;
