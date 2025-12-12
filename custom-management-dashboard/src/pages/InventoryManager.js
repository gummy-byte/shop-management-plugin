import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const InventoryManager = () => {
    const [ products, setProducts ] = useState([]);
    const [ edited, setEdited ] = useState({});
    const [ loading, setLoading ] = useState(true);

    useEffect( () => {
        fetchData();
    }, [] );

    const fetchData = () => {
        setLoading(true);
        api.getInventory().then( data => {
            setProducts(data);
            setLoading(false);
            setEdited({});
        });
    };

    const handleChange = ( id, field, value ) => {
        setEdited( prev => ({
            ...prev,
            [id]: {
                ...(prev[id] || {}),
                [field]: value
            }
        }));
    };

    const saveRow = async ( id ) => {
        if ( ! edited[id] ) return;

        await api.updateInventory([
            { id, ...edited[id] }
        ]);

        // Optimistic update or refresh
        // For simplicity, let's refresh local state effectively
        const updatedProducts = products.map( p => {
            if ( p.id === id ) {
                return { ...p, ...edited[id] };
            }
            return p;
        });
        setProducts(updatedProducts);

        // Clear edits for this ID
        const newEdited = { ...edited };
        delete newEdited[id];
        setEdited(newEdited);
        alert('Product saved!');
    };

    const saveAll = async () => {
        const updates = Object.keys(edited).map( id => ({
            id,
            ...edited[id]
        }));

        if ( updates.length === 0 ) return;

        await api.updateInventory(updates);
        fetchData(); // Refresh all
        alert('All changes saved!');
    };

    if ( loading ) return <div>Loading Inventory...</div>;

    const styles = {
        table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden' },
        th: { padding: '12px', textAlign: 'left', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
        td: { padding: '12px', borderBottom: '1px solid #e5e7eb' },
        input: { padding: '6px', border: '1px solid #ccc', borderRadius: '4px', width: '80px' },
        saveBtn: { background: '#2271b1', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' },
        batchBtn: { position: 'fixed', bottom: '20px', right: '20px', background: '#2271b1', color: '#fff', padding: '15px 30px', borderRadius: '50px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', border: 'none', cursor: 'pointer', fontSize: '16px' }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '20px' }}>Inventory Manager</h1>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Product</th>
                        <th style={styles.th}>SKU</th>
                        <th style={styles.th}>Stock</th>
                        <th style={styles.th}>Price</th>
                        <th style={styles.th}>Cost (COG)</th>
                        <th style={styles.th}>Cost (Op)</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    { products.map( p => {
                        const edits = edited[p.id] || {};
                        return (
                            <tr key={p.id}>
                                <td style={styles.td}>
                                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                        { p.image && <img src={p.image} style={{width:'40px', height:'40px', objectFit:'cover', borderRadius:'4px'}} /> }
                                        {p.name}
                                    </div>
                                </td>
                                <td style={styles.td}>{p.sku}</td>
                                <td style={styles.td}>
                                    <input
                                        type="number"
                                        style={styles.input}
                                        value={ edits.stock !== undefined ? edits.stock : p.stock }
                                        onChange={(e) => handleChange(p.id, 'stock', e.target.value)}
                                    />
                                </td>
                                <td style={styles.td}>
                                    <input
                                        type="number"
                                        style={styles.input}
                                        value={ edits.price !== undefined ? edits.price : p.price }
                                        onChange={(e) => handleChange(p.id, 'price', e.target.value)}
                                    />
                                </td>
                                <td style={styles.td}>
                                    <input
                                        type="number"
                                        style={styles.input}
                                        value={ edits.wc_cog_cost !== undefined ? edits.wc_cog_cost : (p.wc_cog_cost || '') }
                                        onChange={(e) => handleChange(p.id, 'wc_cog_cost', e.target.value)}
                                    />
                                </td>
                                <td style={styles.td}>
                                    <input
                                        type="number"
                                        style={styles.input}
                                        value={ edits.op_cost !== undefined ? edits.op_cost : (p.op_cost || '') }
                                        onChange={(e) => handleChange(p.id, 'op_cost', e.target.value)}
                                    />
                                </td>
                                <td style={styles.td}>
                                    { edited[p.id] && (
                                        <button style={styles.saveBtn} onClick={() => saveRow(p.id)}>Save</button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            { Object.keys(edited).length > 0 && (
                <button style={styles.batchBtn} onClick={saveAll}>
                    Save All ({Object.keys(edited).length}) Changes
                </button>
            )}
        </div>
    );
};

export default InventoryManager;
