import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, Card, Space, message, Select, Upload, Row, Col, Divider } from 'antd';
import { SaveOutlined, ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const { Option } = Select;

const ProductCreate = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const productData = {
                name: values.name,
                type: 'simple',
                sku: values.sku,
                regular_price: values.regular_price,
                sale_price: values.sale_price,
                stock_quantity: values.stock_quantity,
                manage_stock: true,
                description: values.description,
                short_description: values.short_description,
                wc_cog_cost: values.wc_cog_cost,
                op_cost: values.op_cost,
                categories: values.categories,
                stock_status: values.stock_status || 'instock'
            };

            await api.createProduct(productData);
            message.success('Product created successfully!');
            navigate('/inventory');
        } catch (error) {
            message.error('Failed to create product. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={() => navigate('/inventory')}
                    style={{ marginBottom: 16 }}
                >
                    Back to Inventory
                </Button>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>Create New Product</h1>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    stock_status: 'instock',
                    manage_stock: true
                }}
            >
                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        {/* Basic Information */}
                        <Card 
                            title="Basic Information" 
                            style={{ marginBottom: 24 }}
                            styles={{ body: { padding: 24 } }}
                        >
                            <Form.Item
                                label="Product Name"
                                name="name"
                                rules={[{ required: true, message: 'Please enter product name' }]}
                            >
                                <Input size="large" placeholder="Enter product name" />
                            </Form.Item>

                            <Form.Item
                                label="Product Type"
                                tooltip="Currently only Simple products are supported"
                            >
                                <Input size="large" value="Simple Product" disabled />
                            </Form.Item>
                        </Card>

                        {/* Pricing */}
                        <Card 
                            title="Pricing" 
                            style={{ marginBottom: 24 }}
                            styles={{ body: { padding: 24 } }}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Regular Price ($)"
                                        name="regular_price"
                                        rules={[{ required: true, message: 'Please enter regular price' }]}
                                    >
                                        <InputNumber 
                                            size="large"
                                            style={{ width: '100%' }}
                                            min={0}
                                            precision={2}
                                            placeholder="0.00"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Sale Price ($)"
                                        name="sale_price"
                                    >
                                        <InputNumber 
                                            size="large"
                                            style={{ width: '100%' }}
                                            min={0}
                                            precision={2}
                                            placeholder="0.00"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider />

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Cost (COG)"
                                        name="wc_cog_cost"
                                        tooltip="Cost of Goods - WooCommerce Cost of Goods"
                                    >
                                        <InputNumber 
                                            size="large"
                                            style={{ width: '100%' }}
                                            min={0}
                                            precision={2}
                                            placeholder="0.00"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Cost (Op)"
                                        name="op_cost"
                                        tooltip="Operational Cost"
                                    >
                                        <InputNumber 
                                            size="large"
                                            style={{ width: '100%' }}
                                            min={0}
                                            precision={2}
                                            placeholder="0.00"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        {/* Inventory */}
                        <Card 
                            title="Inventory" 
                            style={{ marginBottom: 24 }}
                            styles={{ body: { padding: 24 } }}
                        >
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        label="SKU"
                                        name="sku"
                                        rules={[{ required: true, message: 'Please enter SKU' }]}
                                    >
                                        <Input size="large" placeholder="Enter SKU" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Stock Quantity"
                                        name="stock_quantity"
                                    >
                                        <InputNumber 
                                            size="large"
                                            style={{ width: '100%' }}
                                            min={0}
                                            placeholder="0"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Stock Status"
                                name="stock_status"
                            >
                                <Select size="large">
                                    <Option value="instock">In Stock</Option>
                                    <Option value="outofstock">Out of Stock</Option>
                                    <Option value="onbackorder">On Backorder</Option>
                                </Select>
                            </Form.Item>
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        {/* Product Image */}
                        <Card 
                            title="Product Image" 
                            style={{ marginBottom: 24 }}
                            styles={{ body: { padding: 24 } }}
                        >
                            <Form.Item name="image">
                                <Upload
                                    listType="picture-card"
                                    maxCount={1}
                                    beforeUpload={() => false}
                                >
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                </Upload>
                            </Form.Item>
                            <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                                Recommended: 800x800px or larger
                            </p>
                        </Card>

                        {/* Categories */}
                        <Card 
                            title="Categories" 
                            style={{ marginBottom: 24 }}
                            styles={{ body: { padding: 24 } }}
                        >
                            <Form.Item name="categories">
                                <Select 
                                    mode="multiple"
                                    size="large"
                                    placeholder="Select categories"
                                    style={{ width: '100%' }}
                                >
                                    <Option value="1">Uncategorized</Option>
                                    {/* Categories will be loaded from API */}
                                </Select>
                            </Form.Item>
                        </Card>

                        {/* Actions */}
                        <Card styles={{ body: { padding: 24 } }}>
                            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<SaveOutlined />}
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                >
                                    Create Product
                                </Button>
                                <Button
                                    size="large"
                                    onClick={() => navigate('/inventory')}
                                    block
                                >
                                    Cancel
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default ProductCreate;
