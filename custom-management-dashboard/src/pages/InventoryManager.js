import React, { useEffect, useState } from 'react';
import { Table, Input, Button, message, Space, Avatar, Typography, Dropdown, Checkbox, Modal, Select, InputNumber } from 'antd';
import { SaveOutlined, ExportOutlined, SettingOutlined, PlusOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const { Title } = Typography;
const { Option } = Select;

const InventoryManager = () => {
    const navigate = useNavigate();
    const [ products, setProducts ] = useState([]);
    const [ edited, setEdited ] = useState({});
    const [ loading, setLoading ] = useState(true);
    const [ exportLoading, setExportLoading ] = useState(false);
    const [ exportModalVisible, setExportModalVisible ] = useState(false);
    const [ pagination, setPagination ] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    // Export Filters
    const [exportFilters, setExportFilters] = useState({
        search: '',
        stockStatus: 'all', // all, instock, outofstock, onbackorder
        priceMin: null,
        priceMax: null
    });

    // Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState({
        image: true,
        name: true,
        sku: true,
        stock: true,
        price: true,
        wc_cog_cost: true,
        op_cost: true,
        actions: true
    });

    useEffect( () => {
        fetchData();
    }, [pagination.current, pagination.pageSize] );

    const fetchData = () => {
        setLoading(true);
        api.getInventory({ page: pagination.current, per_page: pagination.pageSize }).then( data => {
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

    const handleExportAll = async () => {
        setExportLoading(true);
        try {
            // Fetch ALL products with filters applied
            const params = {
                per_page: -1, // Get all products
                search: exportFilters.search || undefined,
                stock_status: exportFilters.stockStatus !== 'all' ? exportFilters.stockStatus : undefined,
                min_price: exportFilters.priceMin || undefined,
                max_price: exportFilters.priceMax || undefined
            };

            const data = await api.getInventory(params);
            const allProducts = Array.isArray(data) ? data : data.items;

            // Generate CSV
            const headers = Object.keys(visibleColumns).filter(k => visibleColumns[k] && k !== 'actions' && k !== 'image');
            const csvContent = [
                headers.join(','),
                ...allProducts.map(row => 
                    headers.map(header => {
                        const val = row[header];
                        return `"${val || ''}"`; 
                    }).join(',')
                )
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `inventory_export_${new Date().toISOString().slice(0,10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            message.success(`Exported ${allProducts.length} products successfully!`);
            setExportModalVisible(false);
        } catch (error) {
            message.error('Export failed. Please try again.');
        } finally {
            setExportLoading(false);
        }
    };

    const allColumns = [
        {
            title: 'Image',
            key: 'image',
            dataIndex: 'image',
            width: 80,
            render: (text) => <Avatar shape="square" src={text} />
        },
        {
            title: 'Product',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
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

    const columns = allColumns.filter(col => visibleColumns[col.key]);

    // Column visibility menu items
    const columnMenuItems = allColumns.map(col => ({
        key: col.key,
        label: (
            <Checkbox 
                checked={visibleColumns[col.key]} 
                onChange={(e) => setVisibleColumns({ ...visibleColumns, [col.key]: e.target.checked })}
            >
                {col.title}
            </Checkbox>
        )
    }));

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Inventory Manager</Title>
                <Space>
                    <Button icon={<PlusOutlined />} type="primary" onClick={() => navigate('/inventory/create')}>Add Product</Button>
                    <Button icon={<ExportOutlined />} onClick={() => setExportModalVisible(true)}>Export</Button>
                    <Dropdown menu={{ items: columnMenuItems }} trigger={['click']}>
                         <Button icon={<SettingOutlined />}>Columns</Button>
                    </Dropdown>
                </Space>
            </div>

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
                scroll={{ x: 'max-content' }}
                style={{ background: '#fff', borderRadius: 8 }}
            />

            {/* Export Modal */}
            <Modal
                title={<span><FilterOutlined /> Export Products</span>}
                open={exportModalVisible}
                onCancel={() => setExportModalVisible(false)}
                onOk={handleExportAll}
                confirmLoading={exportLoading}
                okText="Export"
                width={600}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Product Name</label>
                        <Input 
                            placeholder="Search by product name or SKU"
                            value={exportFilters.search}
                            onChange={e => setExportFilters({ ...exportFilters, search: e.target.value })}
                            allowClear
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Stock Status</label>
                        <Select 
                            style={{ width: '100%' }}
                            value={exportFilters.stockStatus}
                            onChange={val => setExportFilters({ ...exportFilters, stockStatus: val })}
                        >
                            <Option value="all">All Products</Option>
                            <Option value="instock">In Stock</Option>
                            <Option value="outofstock">Out of Stock</Option>
                            <Option value="onbackorder">On Backorder</Option>
                        </Select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Price Range</label>
                        <Space>
                            <InputNumber 
                                placeholder="Min"
                                value={exportFilters.priceMin}
                                onChange={val => setExportFilters({ ...exportFilters, priceMin: val })}
                                prefix="$"
                                min={0}
                                style={{ width: 120 }}
                            />
                            <span>to</span>
                            <InputNumber 
                                placeholder="Max"
                                value={exportFilters.priceMax}
                                onChange={val => setExportFilters({ ...exportFilters, priceMax: val })}
                                prefix="$"
                                min={0}
                                style={{ width: 120 }}
                            />
                        </Space>
                    </div>

                    <div style={{ 
                        padding: 12, 
                        background: '#f0f2f5', 
                        borderRadius: 8,
                        fontSize: 13
                    }}>
                        <strong>Note:</strong> The export will include all products matching the filters above (not limited to the current page).
                    </div>
                </Space>
            </Modal>

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
