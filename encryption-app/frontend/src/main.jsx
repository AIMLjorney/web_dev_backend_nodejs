// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'
// import { AuthProvider } from './context/AuthContext'

// // Remove loading animation when app loads
// document.addEventListener('DOMContentLoaded', () => {
//   const loadingElement = document.getElementById('root-loading');
//   if (loadingElement) {
//     loadingElement.style.display = 'none';
//   }
// });

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )


import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'

// Remove loading animation when app loads
document.addEventListener('DOMContentLoaded', () => {
  const loadingElement = document.getElementById('root-loading');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)