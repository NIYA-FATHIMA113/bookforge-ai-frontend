import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function OwnerNavigation() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <nav className="owner-navigation" aria-label="Owner dashboard navigation">
      <NavLink to="/dashboard" end>Dashboard</NavLink>
      <NavLink to="/dashboard/services">Services</NavLink>
      <NavLink to="/dashboard/resources">Resources</NavLink>
      <NavLink to="/dashboard/hours">Business Hours</NavLink>
      <NavLink to="/dashboard/bookings">Bookings</NavLink>
      <button type="button" onClick={handleLogout}>Log out</button>
    </nav>
  );
}

export default OwnerNavigation;
