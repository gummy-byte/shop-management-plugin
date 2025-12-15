import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CommandCenter from './pages/CommandCenter';
import InventoryManager from './pages/InventoryManager';
import ProductCreate from './pages/ProductCreate';
import OrderAuditor from './pages/OrderAuditor';

const App = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<CommandCenter />} />
                    <Route path="inventory" element={<InventoryManager />} />
                    <Route path="inventory/create" element={<ProductCreate />} />
                    <Route path="orders" element={<OrderAuditor />} />
                </Route>
            </Routes>
        </HashRouter>
    );
};

export default App;
