import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { getToken, logoutUser } from "../services/authService";
import api from "../services/api";

import "../styles/dashboard.css";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

function DashboardLayout() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    const loadUser = async () => {
      try {
        const response = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
      } catch (error) {
        console.error("Failed to load user:", error);

        logoutUser();
        navigate("/login");
      }
    };

    loadUser();
  }, [navigate]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="dashboard-shell">

      {/* SIDEBAR */}
      <aside className="sidebar">

        {/* BRAND */}
        <div className="sidebar-brand">

          <div className="brand-icon">
            ⌖
          </div>

          <div>
            <h2>GeoSense</h2>
            <span>Location Intelligence</span>
          </div>

        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-nav">

          <p className="nav-title">
            MAIN
          </p>

          <NavLink
            to="/dashboard"
            className={(navData) =>
              navData.isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            <span>▦</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/geofences"
            className={(navData) =>
              navData.isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            <span>◎</span>
            Geofences
          </NavLink>

          <NavLink
            to="/devices"
            className={(navData) =>
              navData.isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            <span>▣</span>
            Devices
          </NavLink>

          <NavLink
            to="/locations"
            className={(navData) =>
              navData.isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            <span>⌖</span>
            Locations
          </NavLink>

          <NavLink
            to="/events"
            className={(navData) =>
              navData.isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            <span>◈</span>
            Events
          </NavLink>

          <p className="nav-title system-title">
            SYSTEM
          </p>

          <NavLink
            to="/audit-logs"
            className={(navData) =>
              navData.isActive
                ? "nav-link active"
                : "nav-link"
            }
          >
            <span>◫</span>
            Audit Logs
          </NavLink>

        </nav>

        {/* LOGGED-IN USER */}
        <div className="sidebar-user">

          <div className="user-avatar">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div className="user-details">

            <strong>
              {user?.name || "Loading..."}
            </strong>

            <span>
              {user?.role || "User"}
            </span>

          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            ↪
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        {/* TOP BAR */}
        <header className="topbar">

          <div>

            <h1>
              Dashboard
            </h1>

            <p>
              Monitor your geofences, devices and location events.
            </p>

          </div>

          <div className="topbar-user">

            <span className="online-dot"></span>

            {user?.name || "User"}

          </div>

        </header>

        {/* PAGE CONTENT */}
        <section className="page-content">
          <Outlet />
        </section>

      </main>

    </div>
  );
}

export default DashboardLayout;