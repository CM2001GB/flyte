import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// import './styles/app.css';
// import '@picocss/pico/css/pico.min.css'
import '@picocss/pico/css/pico.amber.css'
// import '@picocss/pico/css/pico.conditional.orange.css'
import './styles/app.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
