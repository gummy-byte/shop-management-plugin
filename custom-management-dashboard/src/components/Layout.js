import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Drawer } from 'antd';
import { DashboardOutlined, ShopOutlined, AuditOutlined, LogoutOutlined, CloseOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
    const { adminUrl, siteLogo } = window.cmdSettings || { adminUrl: '/wp-admin/', siteLogo: '' };
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    
    // Convert pathname to menu key
    const currentKey = location.pathname === '/' ? 'dashboard' : location.pathname.substring(1);

    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: <Link to="/">Command Center</Link>,
        },
        {
            key: 'inventory',
            icon: <ShopOutlined />,
            label: <Link to="/inventory">Inventory</Link>,
        },
        {
            key: 'orders',
            icon: <AuditOutlined />,
            label: <Link to="/orders">Order Auditor</Link>,
        },
    ];

    const logoContent = (
        <div style={{ 
            height: 48, 
            margin: 16, 
            background: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: 12, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            overflow: 'hidden',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.1)' 
        }}>
            { siteLogo ? (
                <img src={siteLogo} alt="Logo" style={{ maxHeight: '80%', maxWidth: '80%', objectFit: 'contain' }} />
            ) : (
                <span style={{ color: 'white', fontWeight: '700', fontSize: '16px', letterSpacing: '1px' }}>CMD</span>
            )}
        </div>
    );

    return (
        <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            {/* Mobile Drawer */}
            {isMobile && (
                <Drawer
                    placement="left"
                    onClose={() => setMobileDrawerVisible(false)}
                    open={mobileDrawerVisible}
                    width={250}
                    bodyStyle={{ padding: 0, background: '#001529' }}
                    closable={false} 
                >
                    {logoContent}
                    <Menu 
                        theme="dark" 
                        mode="inline" 
                        selectedKeys={[currentKey]} 
                        items={menuItems} 
                        onClick={() => setMobileDrawerVisible(false)}
                        style={{ background: 'transparent' }}
                    />
                </Drawer>
            )}

            {/* Desktop Floating Sidebar */}
            {!isMobile && (
                <Sider 
                    collapsible 
                    collapsed={collapsed} 
                    onCollapse={(value) => setCollapsed(value)}
                    breakpoint="lg"
                    onBreakpoint={(broken) => {
                        setIsMobile(broken);
                        if (broken) setCollapsed(true);
                    }}
                    width={240}
                    className="floating-sider"
                >
                    {logoContent}
                    <Menu 
                        theme="dark" 
                        defaultSelectedKeys={['dashboard']} 
                        selectedKeys={[currentKey]} 
                        mode="inline" 
                        items={menuItems}
                        style={{ background: 'transparent', borderRight: 0 }} 
                    />
                </Sider>
            )}

            <Layout 
                className="site-layout" 
                style={{ 
                    marginLeft: isMobile ? 0 : (collapsed ? 80 + 32 : 240 + 32),
                    transition: 'margin-left 0.2s' 
                }}
            >
                <Header className="site-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {isMobile && (
                            <Button 
                                type="text" 
                                icon={<DashboardOutlined />} 
                                onClick={() => setMobileDrawerVisible(true)}
                                style={{ fontSize: '18px', width: 40, height: 40 }}
                            />
                        )}
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#1f1f1f' }}>
                            Management Portal
                        </h2>
                    </div>
                    <Button 
                        type="default" 
                        danger 
                        icon={<LogoutOutlined />} 
                        href={adminUrl}
                        shape="round"
                    >
                        Exit
                    </Button>
                </Header>
                <Content style={{ margin: '24px 16px', overflow: 'initial' }}>
                    <div
                        style={{
                            padding: 24,
                            background: '#fff',
                            borderRadius: '16px',
                            minHeight: 360,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                    >
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default AppLayout;
