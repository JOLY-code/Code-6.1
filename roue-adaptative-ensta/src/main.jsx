import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { SectorProvider } from './context/SectorContext.jsx';
import { SecurityProvider } from './context/SecurityContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SecurityProvider>
      <SectorProvider>
        <App />
      </SectorProvider>
    </SecurityProvider>
  </React.StrictMode>,
);
