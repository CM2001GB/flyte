import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// for creating react forms see the following documentation (which I used)
// https://www.w3schools.com/react/react_forms_submit.asp
// https://react.dev/reference/react-dom/components/form

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        drone_registration_number: '',
        flyer_id: ''
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
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type' : 'application/json'},
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || `Registration failed - Server returned: ${response.status}`)
            }

            const data = await response.json();
            setSuccess(`Account created for ${data.email}. Redirecting to login.`);

            setTimeout(() => navigate('/'), 2000);
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

            <div className="page register">
                <h2>Register Account</h2>
            </div>

            <form className="session-menu-input" onSubmit={handleSubmit}>

                <label htmlFor="first_name">First Name</label>
                <input type="text" id="first_name" name="first_name"
                    value={form.first_name} onChange={handleChange} required maxLength="50" />

                <label htmlFor="last_name">Last Name</label>
                <input type="text" id="last_name" name="last_name"
                    value={form.last_name} onChange={handleChange} required maxLength="50" />

                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email"
                    value={form.email} onChange={handleChange} required />

                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password"
                    value={form.password} onChange={handleChange} required minLength="6" />

                <label htmlFor="drone_registration_number">Drone Registration Number</label>
                <input type="text" id="drone_registration_number" name="drone_registration_number"
                    value={form.drone_registration_number} onChange={handleChange} required />

                <label htmlFor="flyer_id">Flyer ID</label>
                <input type="text" id="flyer_id" name="flyer_id"
                    value={form.flyer_id} onChange={handleChange} required />

                <button type="submit" disabled={submitting}>
                    {submitting ? 'Registering…' : 'Register'}
                </button>

                {error && <p style={{ color: 'var(--pico-color-red-500, #e53935)' }}>{error}</p>}
                {success && <p style={{ color: 'var(--pico-color-green-500, #43a047)' }}>{success}</p>}
            </form>

        </main>
    );
}