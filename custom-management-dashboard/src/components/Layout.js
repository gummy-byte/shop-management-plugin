import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
    const { adminUrl } = window.cmdSettings || { adminUrl: '/wp-admin/' };

    const styles = {
        container: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#f0f2f5' },
        header: {
            background: '#fff',
            padding: '10px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 10
        },
        nav: { display: 'flex', gap: '20px' },
        link: { textDecoration: 'none', color: '#333', fontWeight: '500', padding: '8px 12px', borderRadius: '4px' },
        main: { flex: 1, overflow: 'auto', padding: '20px' },
        exitBtn: {
            background: '#dc3545',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            textDecoration: 'none'
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={styles.nav}>
                    <Link style={styles.link} to="/">Command Center</Link>
                    <Link style={styles.link} to="/inventory">Inventory</Link>
                    <Link style={styles.link} to="/orders">Order Auditor</Link>
                </div>
                <div>
                    <a href={adminUrl} style={styles.exitBtn}>Exit to WP Admin</a>
                </div>
            </header>
            <main style={styles.main}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
