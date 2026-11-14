import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// for creating react forms see the following documentation (which I used)
// https://www.w3schools.com/react/react_forms_submit.asp
// https://react.dev/reference/react-dom/components/form

export default function FlightSession() {
    const navigate = useNavigate();
    const routeState = useLocation().state; // passed from preflight page

    const [form, setForm] = useState({
        location: routeState ? `${routeState.lat}, ${routeState.lon}` : '',
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        drone_model: '',
        flight_notes: ''
    });  
    
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);


        try {
            const flyerId = localStorage.getItem('flyerId');
            if (!flyerId) {
                throw new Error('Not logged in. Please log in first.');
            }
            const response = await fetch('/api/flights', {
                method: 'POST',
                headers: { 'Content-Type' : 'application/json'},
                body: JSON.stringify({
                    flyerId: flyerId,
                    location: form.location,
                    date: form.date,
                    startTime: form.start_time,
                    endTime: form.end_time,
                    droneModel: form.drone_model,
                    flightNotes: form.flight_notes,
                    status: routeState?.assessedAt ? 'approved' : 'pending'                        
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || `Server returned: ${response.status}`)
            }

            const data = await response.json();
            setSuccess(`Flight: ${data.flight_id} created.`);

            setTimeout(() => navigate('/reports'), 2000);
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false);
        }
    }

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

            <form className="session-menu-input" onSubmit={handleSubmit}>

                <label htmlFor="location">Location</label>
                <input type="text" id="location" name="location"
                    value={form.location} onChange={handleChange} required />

                <label htmlFor="date">Date</label>
                <input type="date" id="date" name="date"
                    value={form.date} onChange={handleChange} required />

                <label htmlFor="start_time">Start Time</label>
                <input type="time" id="start_time" name="start_time"
                    value={form.start_time} onChange={handleChange} required />

                <label htmlFor="end_time">End Time</label>
                <input type="time" id="end_time" name="end_time"
                    value={form.end_time} onChange={handleChange} required />

                <label htmlFor="drone_model">Drone Model</label>
                <input type="text" id="drone_model" name="drone_model"
                    value={form.drone_model} onChange={handleChange} required maxLength="50" />

                <label htmlFor="flight_notes">Flight Notes</label>
                <textarea id="flight_notes" name="flight_notes" rows="4"
                    value={form.flight_notes} onChange={handleChange} />

                <button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit Flight Session'}
                </button>

                {error && <p style={{ color: 'var(--pico-color-red-500, #e53935)' }}>{error}</p>}
                {success && <p style={{ color: 'var(--pico-color-green-500, #43a047)' }}>{success}</p>}

                {/* <button type="submit" onClick={() => navigate('/flight-session')}>Submit Flight Session</button> */}
            </form>

        </main>
    );
}