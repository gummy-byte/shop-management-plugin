import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const CommandCenter = () => {
    const [ stats, setStats ] = useState(null);
    const [ loading, setLoading ] = useState(true);

    useEffect( () => {
        api.getStats().then( data => {
            setStats(data);
            setLoading(false);
        });
    }, [] );

    if ( loading ) return <div>Loading Command Center...</div>;

    const styles = {
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
        card: { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
        title: { margin: '0 0 10px 0', fontSize: '14px', color: '#666', textTransform: 'uppercase' },
        value: { fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#333' }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '20px' }}>Command Center</h1>
            <div style={styles.grid}>
                <div style={styles.card}>
                    <h3 style={styles.title}>Today's Sales</h3>
                    <p style={styles.value}>${stats.sales_today}</p>
                    <small>{stats.sales_count} orders</small>
                </div>
                <div style={styles.card}>
                    <h3 style={styles.title}>Active Members</h3>
                    <p style={styles.value}>{stats.active_members}</p>
                </div>
                <div style={styles.card}>
                    <h3 style={styles.title}>Low Stock Alerts</h3>
                    <p style={styles.value} style={{...styles.value, color: '#dc3545'}}>{stats.low_stock_count}</p>
                </div>
            </div>
        </div>
    );
};

export default CommandCenter;
