import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Login from './pages/login';
import Register from './pages/register';
import Preflight from './pages/preflight';
import FlightSession from './pages/flight-session';
import AfterFlightReports from './pages/reports';

function App() {
  return (
    <BrowserRouter>
        <nav>
            {/* <Link to="/">Login</Link> */}
            {/* <Link to="/">Preflight</Link> */}
            {/* <Link to="/session">Flight Session</Link> */}
            {/* <Link to="/reports">After-Flight Reports</Link> */}
        </nav>
        <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/preflight" element={<Preflight />} />
              <Route path="/session" element={<FlightSession />} />
              <Route path="/reports" element={<AfterFlightReports />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;