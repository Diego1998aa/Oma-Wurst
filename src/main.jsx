// src/main.jsx

// --- IMPORTACIONES ---
import './css/styles.css';
import './css/Stack.css';
import 'swiper/css/bundle';
import '@fortawesome/fontawesome-free/css/all.css';

// Importamos scripts de funcionalidad (deja que script.js maneje los productos)
import './js/database.js'; // Asegúrate de que database.js inicialice el cliente
import './js/script.js';
import './js/video-player.js';
import './js/correo2.js';

// --- REACT ---
import React from 'react';
import ReactDOM from 'react-dom/client';
import Stack from './Stack.jsx';
import FadeContent from './components/FadeContent.jsx';

// ========================================================
// === SOLO LOGICA DE REACT (GALERÍA STACK) ===
// ========================================================
const cardsData = [
    { id: 1, img: 'assets/historia/historia_01.jpg', type: 'image' },
    { id: 2, img: 'assets/historia/historia_02.jpg', type: 'image' },
    { id: 3, img: 'assets/historia/historia_03.jpg', type: 'image' },
    { id: 4, img: 'assets/historia/historia_04.jpg', type: 'image' },
    { id: 5, img: 'assets/historia/historia_05.jpg', type: 'image' },
    { id: 6, img: 'assets/historia/historia_06.jpg', type: 'image' },
    { id: 7, img: 'assets/historia/historia-oma_frame.jpg', videoUrl: 'assets/historia-oma.mp4', type: 'video' },
];

const stackRoot = document.getElementById('stack-root');
if (stackRoot) {
  ReactDOM.createRoot(stackRoot).render(
    <React.StrictMode>
      <FadeContent blur={false} duration={1200} easing="ease-out" delay={200} threshold={0.3} initialOpacity={0.3}>
        <Stack cardsData={cardsData} cardDimensions={{ width: 628, height: 394 }} />
      </FadeContent>
    </React.StrictMode>,
  );
}
// ELIMINADO: Toda la lógica de loadPublicProducts y displayProducts que estaba aquí abajo.
// Esa lógica ya existe y es mejor en script.js