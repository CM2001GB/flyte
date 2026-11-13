import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Homepage() {

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

            <div className="session-menu-input">

                <label htmlFor="email">Email</label>
                <input type="email" id="email-input" name="email-input" required />

                <label htmlFor="password">Password</label>
                <input type="password" id="password-input" name="password-input" required />

                <button type="submit">Login</button>
                <button type="submit">Register</button>
            </div>

        </main>
    );
}