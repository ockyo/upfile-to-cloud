import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Routes

import Login from './components/login';
import Home from './components/home';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes> 
          <Route path="/" element={<Login />} /> 
          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
    </Router>

  );
}

export default App;
