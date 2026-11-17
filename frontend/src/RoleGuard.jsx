import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { ROLE_HOME } from './roleAccess';

export default function RoleGuard({ allowedRoles }) {
  const user = useOutletContext();

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={ROLE_HOME[user?.role] || '/login'} replace />;
  }

  return <Outlet context={user} />;
}
