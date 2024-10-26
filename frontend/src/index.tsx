import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import InteractiveTable from './components/InteractiveTable';
import Dashboard from './components/Dashboard/Dashboard';
import App from './App';
import TablesList from './components/tablesList/TablesList';
import Registration from './components/profille/Registration';
import Login from './components/profille/Login';
import StartPage from './components/profille/StartPage';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const router = createBrowserRouter([

  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <Navigate to="tables" />
      },
      {
        path: 'tables',
        element: <TablesList />,
      },
      {
        path: 'table/:id',
        element: <InteractiveTable />,
      },
      {
        path: 'analyse',
        element: <Dashboard />,
      }
    ]
  },
  {
    path: '/signin',
    element: <StartPage />,
    children: [
      {
        path: '',
        element: <Navigate to="autorizate" />
      },
      {
        path: 'autorizate',
        element: <Login />,
      },
      {
        path: 'registrate',
        element: <Registration />,
      }]
  }
])

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);