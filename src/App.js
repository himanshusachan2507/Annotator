import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PDFViewer from './components/PDFViewer';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to='/login' />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to='/dashboard' />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/dashboard' element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path='/viewer/:uuid' element={
          <PrivateRoute><PDFViewer /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
