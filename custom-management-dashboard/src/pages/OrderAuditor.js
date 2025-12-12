import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const OrderAuditor = () => {
    const [ orders, setOrders ] = useState([]);
    const [ loading, setLoading ] = useState(true);

    useEffect( () => {
        api.getOrders().then( data => {
            setOrders(data);
            setLoading(false);
        });
    }, [] );

    const handleDownloadInvoice = async ( id ) => {
        try {
            const data = await api.getInvoiceUrl(id);
            if ( data.url ) {
                window.open( data.url, '_blank' );
            } else {
                alert('Invoice URL not found.');
            }
        } catch ( err ) {
            alert('Failed to get invoice: ' + err.message);
        }
    };

    if ( loading ) return <div>Loading Orders...</div>;

    const styles = {
        table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden' },
        th: { padding: '12px', textAlign: 'left', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
        td: { padding: '12px', borderBottom: '1px solid #e5e7eb' },
        btn: { background: '#fff', border: '1px solid #ccc', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
        profit: { color: 'green', fontWeight: 'bold' }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '20px' }}>Order Auditor</h1>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Order #</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Customer</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Total</th>
                        <th style={styles.th}>Profit (Est.)</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    { orders.map( order => (
                        <tr key={order.id}>
                            <td style={styles.td}>#{order.number}</td>
                            <td style={styles.td}>{order.date}</td>
                            <td style={styles.td}>{order.customer}</td>
                            <td style={styles.td}>{order.status}</td>
                            <td style={styles.td}>${order.total}</td>
                            <td style={styles.td}>
                                <span style={styles.profit}>${order.profit.toFixed(2)}</span>
                            </td>
                            <td style={styles.td}>
                                <button style={styles.btn} onClick={() => handleDownloadInvoice(order.id)}>
                                    Download Invoice
                                </button>
                                <button style={styles.btn} onClick={() => alert('Breakdown details: Cost data is derived from product meta (wc_cog_cost/op_cost).')}>
                                    Cost Breakdown
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderAuditor;
