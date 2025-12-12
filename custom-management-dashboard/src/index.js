import { createRoot } from '@wordpress/element';
import App from './App';

document.addEventListener( 'DOMContentLoaded', () => {
    const container = document.getElementById( 'cmd-root' );
    if ( container ) {
        const root = createRoot( container );
        root.render( <App /> );
    }
} );
