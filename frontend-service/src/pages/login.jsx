import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// for creating react forms see the following documentation (which I used)
// https://www.w3schools.com/react/react_forms_submit.asp
// https://react.dev/reference/react-dom/components/form

export default function Login() {
const navigate = useNavigate();

    const [form, setForm] = useState({
        email: '',
        password: '',
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
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type' : 'application/json'},
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || `Login failed - Server returned: ${response.status}`)
            }

            const data = await response.json();
            localStorage.setItem('token', data.token); // we store the token data so other pages can use it
            localStorage.setItem('flyerId', data.flyer_id); // if we don't, no other page knows about the auth
            setSuccess(`Login successful. Redirecting...`);
            
            setTimeout(() => navigate('/preflight'), 2000);
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

            <div className="page homepage">
                <h2>Homepage</h2>
            </div>

            <form className="session-menu-input" onSubmit={handleSubmit}>

                <label htmlFor="email">Email</label>
                <input type="email" id="email-input" name="email" 
                    value={form.email} onChange={handleChange} required />

                <label htmlFor="password">Password</label>
                <input type="password" id="password-input" name="password" 
                    value={form.password} onChange={handleChange} required />


                <button type="submit" disabled={submitting}>
                {submitting ? 'Logging in...' : 'Login'}
                </button>

                <button type="button" onClick={() => navigate('/register')}>
                    Register
                </button>

                {error && <p style={{ color: 'var(--pico-color-red-500, #e53935)' }}>{error}</p>}
                {success && <p style={{ color: 'var(--pico-color-green-500, #43a047)' }}>{success}</p>}

            </form>

        </main>
    );
}