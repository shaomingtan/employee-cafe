import './App.css';
import { Route, Routes, Navigate } from 'react-router-dom'
import ResponsiveAppBar from './components/Nav';
import Cafe from './components/Cafe'
import CafeForm from './components/CafeForm'
import Employee from './components/Employee'
import EmployeeForm from './components/EmployeeForm'
import SnackBar from './components/SnackBar';

function App() {
  return (
    <div className="App">
      <ResponsiveAppBar />
      <Routes>
        <Route exact path="/" element={ <Navigate to="/cafes" />}/>
        <Route path="/cafes" element={<Cafe />}/>
        <Route path="/cafes/:cafeId" element={<CafeForm />}/>
        <Route path="/employees" element={<Employee />}/>
        <Route path="/employees/:employeeId" element={<EmployeeForm />}/>
      </Routes>
      <SnackBar/>
    </div>
  );
}

export default App;
