import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AfterFlightReports() {
    const navigate = useNavigate();

    return (
        <main className="container">

            <div className="title-container">
                <div className="title-text">
                    <h1>FLYTE</h1>
                </div>
            </div>

            <div className="page after-flight-reports">
                <h2>After-Flight Reports</h2>
            </div>

            <div className="report-menu-container">
                <div className="report-menu">
                    <label htmlFor='report-select'>Select Report</label>
                    <select id="report-select" name="report-select">
                        <option value="">-- No Reports Available</option>
                    </select>
                </div>
            </div>

            <div className="user-options-menu-container">
                <div className="user-options-menu">
                    <button id="new-flight" onClick={() => navigate('/preflight')}>
                        Start New Flight
                    </button>                    
                </div>
            </div>

        </main>
    );
}