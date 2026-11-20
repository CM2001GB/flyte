// Preflight Safety Check Handler
// Calls the API Gateway, then Orchestrator, then preflight services (Notam, Weather, SunriseSunset)
// and then displays the assessment of their results

const GATEWAY_URL = 'http://localhost:7000';

document.querySelector('#pf-safety').addEventListener('click', runPreflightCheck);

async function runPreflightCheck() {
    const resultDiv = document.querySelector('#assessment-result');
    const detailDiv = document.querySelector('#assessment-detail');

    // clear any previous results
    resultDiv.className = "result";
    resultDiv.textContent = "";
    resultDiv.innerHTML = "";

    // check if location is known first
    if (!userLocation.lat || !userLocation.lon) {
        resultDiv.className = "result fail";
        resultDiv.textContent = "Location not available. Please allow location access and try again.";
        return;
    }

    resultDiv.className = "result loading";
    resultDiv.textContent = "Running preflight checks.";

    try { // try/catch for making sure the gateway is actually active, if not throw an error
        const dateTime = new Date().toISOString();
        const url = `${GATEWAY_URL}/api/flight/assess?lat=${userLocation.lat}&lon=${userLocation.lon}&datetime=${dateTime}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Gateway returned ${response.status}`);
        }

        const data = await response.json();

        if (data.can_fly) { // all checks passed
            resultDiv.className = 'result pass';
            resultDiv.textContent = data.summary;

            detailDiv.innerHTML = buildServiceSummary(data.services);

            // after a short delay, transition to the flight session view
            setTimeout(() => {
                showFlightSession();
            }, 2000);

        } else { // one or more checks failed
            resultDiv.className = 'result fail';
            resultDiv.textContent = data.summary;

            detailDiv.innerHTML = buildServiceSummary(data.services);
        }
    } catch (err) {
        resultDiv.className = "result fail";
        resultDiv.textContent = "Could not reach the assessment service. Is the Gateway running on port 7000?";
        detailDiv.innerHTML = `<p class="error-detail">${err.message}</p>`;
    }
}

// build an HTML summary of each service verdict
function buildServiceSummary(services) {
  let html = '<ul class="service-list">';

  for (const [name, verdict] of Object.entries(services)) {
    const icon = verdict.verdict === 'pass' ? 'pass-icon' : 'fail-icon';
    const label = verdict.verdict === 'pass' ? 'PASS' : 'FAIL';

    html += `<li class="${icon}">
      <strong>${name.toUpperCase()}</strong>: ${label}`;

    if (verdict.breached_conditions && verdict.breached_conditions.length > 0) {
      html += `<br/><span class="breached">Breached: ${verdict.breached_conditions.join(', ')}</span>`;
    }

    html += `</li>`;
  }

  html += '</ul>';
  return html;
}

// transition the page to the flight session view
function showFlightSession() {
  const mainContent = document.querySelector('#main-content');
  const sessionContent = document.querySelector('#session-content');

  mainContent.style.display = 'none';
  sessionContent.style.display = 'block';

  // populate the flight session with location info
  document.querySelector('#session-location').textContent =
    `Lat: ${userLocation.lat.toFixed(4)}, Lon: ${userLocation.lon.toFixed(4)}`;
  document.querySelector('#session-time').textContent =
    new Date().toLocaleString();
}

// return to the preflight page from the flight session
function endFlightSession() {
  const mainContent = document.querySelector('#main-content');
  const sessionContent = document.querySelector('#session-content');

  sessionContent.style.display = 'none';
  mainContent.style.display = 'block';

  // clear previous assessment
  document.querySelector('#assessment-result').className = 'result';
  document.querySelector('#assessment-result').textContent = '';
  document.querySelector('#assessment-detail').innerHTML = '';
}