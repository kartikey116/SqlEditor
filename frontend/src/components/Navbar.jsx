import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.scss';

export default function Navbar() {
    const { pathname } = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <nav className="navbar">
            <Link to="/" className="nav-logo">
                <div className="nav-logo-icon">⚡</div>
                Cipher<span>SQL</span>Studio
            </Link>
            <ul className="nav-links">
                <li><Link to="/" className={pathname === '/' ? 'active' : ''}>Challenges</Link></li>
                {user && (
                    <>
                        <li className="nav-user">
                            <div className="nav-avatar">{user.username[0].toUpperCase()}</div>
                            <span>{user.username}</span>
                        </li>
                        <li>
                            <button className="nav-logout" onClick={handleLogout}>Logout</button>
                        </li>
                    </>
                )}
                {!user && (
                    <li><Link to="/login" className="nav-cta">Sign In →</Link></li>
                )}
            </ul>
        </nav>
    );
}
