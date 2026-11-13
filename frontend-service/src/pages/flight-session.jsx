import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FlightSession() {

    return (
        <main className="container">

            <div className="title-container">
                <div className="title-text">
                    <h1>FLYTE</h1>
                </div>
            </div>

            <div className="page flightsession">
                <h2>Flight Session</h2>
            </div>

            <div className="session-menu-input">
                <label htmlFor="date">Date</label>
                <input type="date" id="date" name="date" required />

                <label htmlFor="start-time">Start Time</label>
                <input type="time" id="start-time" name="start-time" required />

                <label htmlFor="end-time">End Time</label>
                <input type="time" id="end-time" name="end-time" required />

                <label htmlFor="drone-model">Drone Model</label>
                <input type="text" id="drone-model" name="drone-model" required maxLength="12" />

                <label htmlFor="flight-notes">Flight Notes</label>
                <textarea id="flight-notes" name="flight-notes" rows="4" />

                <button type="submit">Submit Flight Session</button>
            </div>

        </main>
    );
}