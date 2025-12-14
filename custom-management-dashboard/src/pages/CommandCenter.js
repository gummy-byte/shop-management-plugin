import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Alert, Spin } from 'antd';
import { DollarOutlined, UserOutlined, WarningOutlined, ShoppingCartOutlined } from '@ant-design/icons';
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

    if ( loading ) return <div style={{textAlign:'center', marginTop: 50}}><Spin size="large" tip="Loading Command Center..." /></div>;

    return (
        <div>
            <h2 style={{ marginBottom: '24px' }}>Command Center</h2>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                    <Card bordered={false}>
                        <Statistic 
                            title="Sales (This Month)" 
                            value={stats.sales_today} 
                            precision={2} 
                            prefix={<DollarOutlined />} 
                        />
                        <div style={{ marginTop: 8, color: '#888' }}>
                            <ShoppingCartOutlined /> {stats.sales_count} orders
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card bordered={false}>
                        <Statistic 
                            title="Active Members" 
                            value={stats.active_members} 
                            prefix={<UserOutlined />} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card bordered={false}>
                        <Statistic 
                            title="Low Stock Alerts" 
                            value={stats.low_stock_count} 
                            valueStyle={{ color: stats.low_stock_count > 0 ? '#cf1322' : '#3f8600' }}
                            prefix={<WarningOutlined />} 
                        />
                        { stats.low_stock_count > 0 && (
                            <div style={{ marginTop: 10 }}>
                                <Alert message="Action Needed" type="error" showIcon small />
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default CommandCenter;
