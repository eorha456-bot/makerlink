import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MakerLinkApp } from './app/MakerLinkApp';
import './shared/styles/global.css';

createRoot(document.getElementById('root')).render(<StrictMode><MakerLinkApp /></StrictMode>);
