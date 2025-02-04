import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Admin from './Admin'; // Import Admin.js
import './Layout.css';

function Layout() {
    const location = useLocation();

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <div className="admin-sidebar">
                <h2>Admin Menu</h2>
                <ul>
                    <li>
                        <NavLink to="/admin" end className={({ isActive }) => isActive ? 'link active' : 'link'}>
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/registeruser" className={({ isActive }) => isActive ? 'link active' : 'link'}>
                            Registered Users
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/userreports" className={({ isActive }) => isActive ? 'link active' : 'link'}>
                            User Reports
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/conversation" className={({ isActive }) => isActive ? 'link active' : 'link'}>
                            Conversation
                        </NavLink>
                    </li>
                </ul>
            </div>

            {/* Only Show Admin.js When at /admin (Exact Path) */}
            <div className="admin-content">
                {location.pathname === "/admin" ? <Admin /> : <Outlet />}
            </div>
        </div>
    );
}

export default Layout;
