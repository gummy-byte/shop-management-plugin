import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Typography, message, Space } from 'antd';
import { DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { Title, Text } = Typography;

const OrderAuditor = () => {
    const [ orders, setOrders ] = useState([]);
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
        api.getOrders({ page: pagination.current, per_page: pagination.pageSize }).then( data => {
             // Check if data is array (old) or object (new)
            if ( Array.isArray(data) ) {
                 setOrders(data);
                 setPagination(prev => ({ ...prev, total: data.length }));
            } else {
                 setOrders(data.items);
                 setPagination(prev => ({ 
                     ...prev, 
                     total: data.total 
                 }));
            }
            setLoading(false);
        });
    };

    const handleTableChange = ( newPagination ) => {
        setPagination( prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize
        }));
    };

    const handleDownloadInvoice = async ( id ) => {
        try {
            const data = await api.getInvoiceUrl(id);
            if ( data.url && data.url !== '#' ) {
                window.open( data.url, '_blank' );
            } else {
                message.error('Invoice URL not found or generation failed.');
            }
        } catch ( err ) {
            message.error('Failed to get invoice: ' + err.message);
        }
    };

    const columns = [
        { title: 'Order #', dataIndex: 'number', key: 'number', render: text => <b>#{text}</b> },
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Customer', dataIndex: 'customer', key: 'customer' },
        { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status',
            render: status => {
                let color = 'default';
                if ( status === 'completed' ) color = 'success';
                if ( status === 'processing' ) color = 'processing';
                if ( status === 'cancelled' ) color = 'error';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            }
        },
        { title: 'Total', dataIndex: 'total', key: 'total', render: val => `$${val.toFixed(2)}` },
        { 
            title: 'Profit (Est.)', 
            dataIndex: 'profit', 
            key: 'profit', 
            render: val => <Text type="success" strong>${val.toFixed(2)}</Text>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button icon={<DownloadOutlined />} size="small" onClick={() => handleDownloadInvoice(record.id)}>
                        Invoice
                    </Button>
                    <Button icon={<InfoCircleOutlined />} size="small" onClick={() => message.info('Cost derived from product meta (wc_cog_cost/op_cost).')}>
                        Cost
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <Title level={2}>Order Auditor</Title>
            <Table 
                columns={columns} 
                dataSource={orders} 
                rowKey="id" 
                loading={loading}
                pagination={{ 
                    current: pagination.current, 
                    pageSize: pagination.pageSize, 
                    total: pagination.total,
                    showSizeChanger: true
                }}
                onChange={handleTableChange}
                scroll={{ x: 800 }}
                style={{ background: '#fff', borderRadius: 8 }}
            />
        </div>
    );
};

export default OrderAuditor;
