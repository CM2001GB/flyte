import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AfterFlightReports() {
    const navigate = useNavigate();

    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFlight, setSelectedFlight] = useState(null);

    // redirect to login if not authenticated
    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
            return;
        }

        // fetch flights for the logged-in user
        async function fetchFlights() {
            try {
                const flyerId = localStorage.getItem('flyerId');
                const response = await fetch(`/api/flights?flyerId=${flyerId}`);

                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}`);
                }

                const data = await response.json();
                setFlights(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchFlights();
    }, [navigate]);

    // find the full flight object when dropdown changes
    function handleSelect(e) {
        const flightId = e.target.value;
        const flight = flights.find(f => f.flight_id === flightId);
        setSelectedFlight(flight || null);
    }

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
                    <label htmlFor="report-select">Select Report</label>
                    <select id="report-select" name="report-select" onChange={handleSelect}>
                        {loading ? (
                            <option value="">Loading flights...</option>
                        ) : flights.length === 0 ? (
                            <option value="">-- No Reports Available --</option>
                        ) : (
                            <>
                                <option value="">-- Select a flight --</option>
                                {flights.map(f => (
                                    <option key={f.flight_id} value={f.flight_id}>
                                        {f.date} — {f.location} ({f.status})
                                    </option>
                                ))}
                            </>
                        )}
                    </select>
                </div>
            </div>

            {/* Show selected flight details */}
            {selectedFlight && (
                <div className="flight-details">
                    <h3>Flight Details</h3>
                    <p><strong>Flight ID:</strong> {selectedFlight.flight_id}</p>
                    <p><strong>Location:</strong> {selectedFlight.location}</p>
                    <p><strong>Date:</strong> {selectedFlight.date}</p>
                    <p><strong>Drone Model:</strong> {selectedFlight.drone_model || 'N/A'}</p>
                    <p><strong>Notes:</strong> {selectedFlight.flight_notes || 'None'}</p>
                    <p><strong>Status:</strong> {selectedFlight.status}</p>
                </div>
            )}

            {error && <p style={{ color: 'var(--pico-color-red-500, #e53935)' }}>{error}</p>}

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