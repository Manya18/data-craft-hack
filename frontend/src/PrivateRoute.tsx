import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
    children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const userId = localStorage.getItem('userId');

    return userId ? <>{children}</> : <Navigate to="/signin" />;
};

export default PrivateRoute;