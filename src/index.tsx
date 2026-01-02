import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';       // Now finds src/App.tsx
import { AppProvider } from './store'; // Now finds src/store.tsx

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);