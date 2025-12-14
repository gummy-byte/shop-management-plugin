import React, { useEffect, useState } from 'react';
import { Table, Input, Button, message, Space, Avatar, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Title } = Typography;

const InventoryManager = () => {
    const [ products, setProducts ] = useState([]);
    const [ edited, setEdited ] = useState({});
    const [ loading, setLoading ] = useState(true);
    const [ pagination, setPagination ] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    useEffect( () => {
        fetchData();
    }, [pagination.current, pagination.pageSize] );

    const fetchData = () => {
        setLoading(true);
        api.getInventory({ page: pagination.current, per_page: pagination.pageSize }).then( data => {
            // Check if data is array (old) or object (new)
            if ( Array.isArray(data) ) {
                 setProducts(data);
                 setPagination(prev => ({ ...prev, total: data.length }));
            } else {
                 setProducts(data.items);
                 setPagination(prev => ({ 
                     ...prev, 
                     total: data.total 
                 }));
            }
            setLoading(false);
            setEdited({});
        });
    };

    const handleTableChange = ( newPagination ) => {
        setPagination( prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize
        }));
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

        const updatedProducts = products.map( p => {
            if ( p.id === id ) {
                return { ...p, ...edited[id] };
            }
            return p;
        });
        setProducts(updatedProducts);

        const newEdited = { ...edited };
        delete newEdited[id];
        setEdited(newEdited);
        message.success('Product saved!');
    };

    const saveAll = async () => {
        const updates = Object.keys(edited).map( id => ({
            id,
            ...edited[id]
        }));

        if ( updates.length === 0 ) return;

        await api.updateInventory(updates);
        fetchData();
        message.success('All changes saved!');
    };

    const columns = [
        {
            title: 'Product',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <Avatar shape="square" src={record.image} />
                    {text}
                </Space>
            )
        },
        {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
        },
        {
            title: 'Stock',
            dataIndex: 'stock',
            key: 'stock',
            render: (text, record) => {
                const val = edited[record.id]?.stock !== undefined ? edited[record.id].stock : text;
                return (
                    <Input 
                        type="number" 
                        value={val} 
                        onChange={e => handleChange(record.id, 'stock', e.target.value)} 
                        style={{ width: 80 }} 
                    />
                );
            }
        },
        {
            title: 'Price ($)',
            dataIndex: 'price',
            key: 'price',
            render: (text, record) => {
                const val = edited[record.id]?.price !== undefined ? edited[record.id].price : text;
                return (
                    <Input 
                        type="number" 
                        value={val} 
                        onChange={e => handleChange(record.id, 'price', e.target.value)} 
                        style={{ width: 90 }} 
                    />
                );
            }
        },
        {
            title: 'Cost (COG)',
            dataIndex: 'wc_cog_cost',
            key: 'wc_cog_cost',
            render: (text, record) => {
                const val = edited[record.id]?.wc_cog_cost !== undefined ? edited[record.id].wc_cog_cost : (text || '');
                return (
                    <Input 
                        type="number" 
                        value={val} 
                        onChange={e => handleChange(record.id, 'wc_cog_cost', e.target.value)} 
                        style={{ width: 90 }} 
                    />
                );
            }
        },
        {
            title: 'Cost (Op)',
            dataIndex: 'op_cost',
            key: 'op_cost',
            render: (text, record) => {
                const val = edited[record.id]?.op_cost !== undefined ? edited[record.id].op_cost : (text || '');
                return (
                    <Input 
                        type="number" 
                        value={val} 
                        onChange={e => handleChange(record.id, 'op_cost', e.target.value)} 
                        style={{ width: 90 }} 
                    />
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => edited[record.id] ? (
                <Button type="primary" icon={<SaveOutlined />} onClick={() => saveRow(record.id)}>
                    Save
                </Button>
            ) : null
        }
    ];

    return (
        <div>
            <Title level={2}>Inventory Manager</Title>
            <Table 
                columns={columns} 
                dataSource={products} 
                rowKey="id" 
                loading={loading} 
                pagination={{ 
                    current: pagination.current, 
                    pageSize: pagination.pageSize, 
                    total: pagination.total,
                    showSizeChanger: true
                }}
                onChange={handleTableChange}
                scroll={{ x: 1000 }}
                style={{ background: '#fff', borderRadius: 8 }}
            />
            { Object.keys(edited).length > 0 && (
                 <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 100 }}>
                    <Button type="primary" size="large" onClick={saveAll} style={{boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 30, height: 50, padding: '0 30px'}}>
                        Save All ({Object.keys(edited).length})
                    </Button>
                 </div>
            )}
        </div>
    );
};

export default InventoryManager;
