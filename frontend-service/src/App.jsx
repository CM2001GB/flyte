import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Homepage from './pages/homepage';
import Register from './pages/register';
import Preflight from './pages/preflight';
import FlightSession from './pages/flight-session';
import AfterFlightReports from './pages/reports';

function App() {
  return (
    <BrowserRouter>
        <nav>
            {/* <Link to="/">Homepage</Link> */}
            {/* <Link to="/">Preflight</Link> */}
            {/* <Link to="/session">Flight Session</Link> */}
            {/* <Link to="/reports">After-Flight Reports</Link> */}
        </nav>
        <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/register" element={<Register />} />
              <Route path="/preflight" element={<Preflight />} />
              <Route path="/session" element={<FlightSession />} />
              <Route path="/reports" element={<AfterFlightReports />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;