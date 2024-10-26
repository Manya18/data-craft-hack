import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import StartPage from './components/StartPage';
import InteractiveTable from './components/InteractiveTable';
import Dashboard from './components/Dashboard/Dashboard';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const router = createBrowserRouter([

  {
    path: '/',
    element: <StartPage />,
    children: [
      {
        path: '',
        element: <Navigate to="table" />
      },
      {
        path: 'table',
        element: <InteractiveTable />,
      },
      {
        path: 'analyse',
        element: <Dashboard />,
      },
    ]
  }
])

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);