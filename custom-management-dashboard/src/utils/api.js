/**
 * API Service wrapper for WP REST API
 */

const getSettings = () => {
    return window.cmdSettings || { root: '', nonce: '' };
};

export const apiFetch = async ( endpoint, options = {} ) => {
    const { root, nonce } = getSettings();
    const url = `${root}cmd/v1${endpoint}`;

    const headers = {
        'X-WP-Nonce': nonce,
        'Content-Type': 'application/json',
        ...options.headers
    };

    const response = await fetch( url, {
        ...options,
        headers
    });

    if ( ! response.ok ) {
        throw new Error( `API Error: ${response.statusText}` );
    }

    return await response.json();
};

export default {
    getStats: () => apiFetch( '/dashboard-stats' ),
    getInventory: () => apiFetch( '/inventory' ),
    updateInventory: ( updates ) => apiFetch( '/inventory/update', {
        method: 'POST',
        body: JSON.stringify({ updates })
    }),
    getOrders: () => apiFetch( '/orders' ),
    getInvoiceUrl: ( id ) => apiFetch( `/orders/${id}/invoice` ),
    getMembers: () => apiFetch( '/members' ),
};
