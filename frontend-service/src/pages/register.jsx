import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {

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

            <div className="session-menu-input">

                <label htmlFor="text">First Name</label>
                <input type="text" id="first-name-input" name="first-name-input" required maxLength="12" />

                <label htmlFor="text">Last Name</label>
                <input type="text" id="last-name-input" name="last-name-input" required maxLength="12" />

                <label htmlFor="email">Email</label>
                <input type="email" id="email-input" name="email-input" required />

                <label htmlFor="password">Password</label>
                <input type="password" id="password-input" name="password-input" required minLength="12" />

                <label htmlFor="text">Drone Registration Number</label>
                <input type="text" id="drone-reg-input" name="drone-reg-input" required maxLength="12" />

                <label htmlFor="text">FlyerID</label>
                <input type="text" id="flyer-id-input" name="flyer-id-input" required maxLength="12" />

                <button type="submit">Register</button>
            </div>

        </main>
    );
}