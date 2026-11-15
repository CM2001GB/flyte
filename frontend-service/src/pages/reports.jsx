import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// for creating react forms see the following documentation (which I used)
// https://www.w3schools.com/react/react_forms_submit.asp
// https://react.dev/reference/react-dom/components/form

export default function AfterFlightReports() {
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editNotes, setEditNotes] = useState('');
    const [editStatus, setEditStatus] = useState('');

    // redirect to login if not authenticated
    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
            return;
        }
        fetchReports();
    }, [navigate]);

    // fetch reports for the logged-in user from the after-report service
    async function fetchReports() {
        try {
            const flyerId = localStorage.getItem('flyerId');
            const response = await fetch(`/api/reports?flyerId=${flyerId}`);

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();
            setReports(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // find the full report object when dropdown changes
    function handleSelect(e) {
        const flightId = e.target.value;
        const report = reports.find(r => r.flight_id === flightId);
        setSelectedReport(report || null);
        setEditing(false);
    }

    // start editing a report
    function handleEdit() {
        if (!selectedReport) return;
        setEditNotes(selectedReport.flight_notes || '');
        setEditStatus(selectedReport.status || 'pending');
        setEditing(true);
    }

    // save edited report via PUT to after-report service
    async function handleSave() {
        try {
            const response = await fetch(`/api/reports/${selectedReport.flight_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    flightNotes: editNotes,
                    status: editStatus
                })
            });

            if (!response.ok) {
                throw new Error(`Update failed: ${response.status}`);
            }

            const updated = await response.json();
            setSelectedReport(updated);
            setEditing(false);
            setError(null);
            // refresh the dropdown list
            await fetchReports();
        } catch (err) {
            setError(err.message);
        }
    }

    // delete a report via DELETE to after-report service
    async function handleDelete() {
        if (!selectedReport) return;
        if (!window.confirm('Are you sure you want to delete this report?')) return;

        try {
            const response = await fetch(`/api/reports/${selectedReport.flight_id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Delete failed: ${response.status}`);
            }

            setSelectedReport(null);
            setEditing(false);
            setError(null);
            // refresh the dropdown list
            await fetchReports();
        } catch (err) {
            setError(err.message);
        }
    }

    // logout - blacklist token via user service, clear localStorage, redirect
    async function handleLogout() {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (err) {
            console.error('Logout request failed:', err.message);
        } finally {
            // always clear localStorage and redirect, even if the request fails
            localStorage.removeItem('token');
            localStorage.removeItem('flyerId');
            localStorage.removeItem('userEmail');
            navigate('/');
        }
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
                            <option value="">Loading reports...</option>
                        ) : reports.length === 0 ? (
                            <option value="">-- No Reports Available --</option>
                        ) : (
                            <>
                                <option value="">-- Select a report --</option>
                                {reports.map(r => (
                                    <option key={r.flight_id} value={r.flight_id}>
                                        {r.date} — {r.location} ({r.status})
                                    </option>
                                ))}
                            </>
                        )}
                    </select>
                </div>
            </div>

            {/* Show selected report details */}
            {selectedReport && !editing && (
                <div className="flight-details">
                    <h3>Report Details</h3>
                    <p><strong>Flight ID:</strong> {selectedReport.flight_id}</p>
                    <p><strong>Location:</strong> {selectedReport.location}</p>
                    <p><strong>Date:</strong> {selectedReport.date}</p>
                    <p><strong>Start Time:</strong> {selectedReport.start_time || 'N/A'}</p>
                    <p><strong>End Time:</strong> {selectedReport.end_time || 'N/A'}</p>
                    <p><strong>Drone Model:</strong> {selectedReport.drone_model || 'N/A'}</p>
                    <p><strong>Flight Notes:</strong> {selectedReport.flight_notes || 'None'}</p>
                    <p><strong>Status:</strong> {selectedReport.status}</p>
                    <p><strong>Created:</strong> {selectedReport.created_at}</p>
                    <p><strong>Last Updated:</strong> {selectedReport.updated_at}</p>

                    <div className="report-actions">
                        <button onClick={handleEdit}>Edit Report</button>
                        <button onClick={handleDelete} style={{ backgroundColor: 'var(--pico-color-red-500, #e53935)' }}>
                            Delete Report
                        </button>
                    </div>
                </div>
            )}

            {/* Edit form */}
            {selectedReport && editing && (
                <div className="flight-details">
                    <h3>Edit Report</h3>
                    <p><strong>Flight ID:</strong> {selectedReport.flight_id}</p>
                    <p><strong>Location:</strong> {selectedReport.location}</p>
                    <p><strong>Date:</strong> {selectedReport.date}</p>

                    <label htmlFor="edit-status">Status</label>
                    <select id="edit-status" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <label htmlFor="edit-notes">Flight Notes</label>
                    <textarea id="edit-notes" rows="4" value={editNotes}
                        onChange={e => setEditNotes(e.target.value)} />

                    <div className="report-actions">
                        <button onClick={handleSave}>Save Changes</button>
                        <button onClick={() => setEditing(false)} type="button">Cancel</button>
                    </div>
                </div>
            )}

            {error && <p style={{ color: 'var(--pico-color-red-500, #e53935)' }}>{error}</p>}

            <div className="user-options-menu-container">
                <div className="user-options-menu">
                    <button id="new-flight" onClick={() => navigate('/preflight')}>
                        Start New Flight
                    </button>
                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

        </main>
    );
}
