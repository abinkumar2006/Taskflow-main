import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark">✓</span> TaskFlow
        </NavLink>

        <button
          className="navbar-toggle"
          aria-label="Toggle navigation menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/tasks" onClick={() => setMenuOpen(false)}>
            Tasks
          </NavLink>
          <span className={`live-badge ${connected ? 'live' : 'offline'}`}>
            <span className="dot" /> {connected ? 'Live' : 'Offline'}
          </span>
          <span className="navbar-user">Hi, {user?.name?.split(' ')[0]}</span>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
