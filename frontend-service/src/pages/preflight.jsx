import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VerdictCard from '../components/verdict-card';

export default function Preflight() {
  const navigate = useNavigate();

  const [location, setLocation] = useState({ lat: null, lon: null });
  const [locationError, setLocationError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);  // full API response
  const [error, setError] = useState(null);

  // grab user location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (err) => {
        setLocationError(`Location access denied: ${err.message}`);
      }
    );
  }, []);

  async function runPreflightCheck() {
    if (!location.lat || !location.lon) {
      setError('Location not available. Please allow location access and try again.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const dateTime = new Date().toISOString();
      const url = `/api/flight/assess?lat=${location.lat}&lon=${location.lon}&datetime=${dateTime}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Gateway returned ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      // if all checks pass, navigate to the flight session after a short delay
      if (data.can_fly) {
        setTimeout(() => {
          navigate('/session', {
            state: {
              lat: location.lat,
              lon: location.lon,
              assessedAt: data.assessed_at,
              services: data.services
            }
          });
        }, 2500);
      }
    } catch (err) {
      setError(`Could not reach the assessment service. Is the Gateway running? (${err.message})`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
    
    <div className="title-container">
        <div className="title-text">
            <h1>FLYTE</h1>
        </div>
    </div>

    <div className="page preflight">
      <h2>Preflight Safety Check</h2>

      {/* Location status */}
      <div className="location-status">
        {locationError ? (
          <p className="status-error">{locationError}</p>
        ) : location.lat ? (
          <p className="status-ok">
            Location: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
          </p>
        ) : (
          <p className="status-loading">Acquiring location...</p>
        )}
      </div>
    
    {/* Run show location button
    <div className="show-location-div">
        <div className="show-location-btn-container">
            <button className="show-location-btn" onClick={() =>{
                if (location.lat && location.lon) {
                window.open(`https://www.google.com/maps?q=${location.lat}, ${location.lon}`, '_blank');
                }
            }} disabled={!location.lat}>
                Show Location
            </button>
        </div>
    </div> */}

    {/* Map Frame */ }
    {location.lat && (
        <div className="map-container"> 
            <iframe
                title="Your Location (approx)"
                width="25%"
                height="300"
                style={{ border: '1px solid #ccc', borderRadius: '8px' }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lon - 0.01},${location.lat - 0.01},${location.lon + 0.01},${location.lat + 0.01}&layer=mapnik&marker=${location.lat},${location.lon}`}
                />
        </div>     
    )}

    {/* Run check button*/}
    <div className="check-preflight-div">
        <div className="check-preflight-container">
            <button className="check-preflight-btn" onClick={runPreflightCheck} disabled={loading || !location.lat}>
                {loading ? 'Running Checks' : 'Run Preflight Check'}
            </button>
        </div>
    </div>

      {/* Error */}
      {error && <div className="result-banner fail">{error}</div>}

      {/* Results */}
      {result && (
        <div className={`result-banner ${result.can_fly ? 'pass' : 'fail'}`}>
          <h3>{result.summary}</h3>
          <div className="verdict-list">
            {Object.entries(result.services).map(([name, verdict]) => (
              <VerdictCard key={name} name={name} verdict={verdict} />
            ))}
          </div>
          {result.can_fly && (
            <p className="redirect-note">Redirecting to Flight Session...</p>
          )}
        </div>
      )}
    </div>

    </main>
  );
}