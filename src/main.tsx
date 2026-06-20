import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner';
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
    <>
        <App />
        <Toaster 
            theme="dark" 
            position="bottom-center"
            toastOptions={{
                style: { 
                    background: 'rgba(15, 15, 15, 0.8)', 
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: '#fff',
                    borderRadius: '20px'
                }
            }}
        />
    </>
);
