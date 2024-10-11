import React from 'react';
import Button from './Button';

import { runScript } from './script'; // Import the script execution function

function App() {
    return (
        <div>
            <Button onClick={runScript} />
        </div>
    );
}

export default App;