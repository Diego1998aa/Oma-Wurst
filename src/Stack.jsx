import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

function CardRotate({ children, onSendToBack, sensitivity }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  function handleDragEnd(_, info) {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="card-rotate"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: 'grabbing' }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

function Stack({
  randomRotation = true,
  sensitivity = 150,
  cardDimensions = { width: 350, height: 220 },
  cardsData = [],
  animationConfig = { stiffness: 260, damping: 20 },
}) {
  const [cards, setCards] = useState(cardsData);

  const sendToBack = id => {
    setCards(prev => {
      const newCards = [...prev];
      const index = newCards.findIndex(card => card.id === id);
      const [card] = newCards.splice(index, 1);
      newCards.unshift(card);
      return newCards;
    });
  };

  const handleCardClick = (card) => {
    if (card.type === 'video') {
      const videoModal = document.getElementById('video-modal-stack');
      const videoSource = document.getElementById('video-modal-source');
      const videoPlayer = document.getElementById('stack-video-player');
      if(videoModal && videoSource && videoPlayer) {
        videoSource.src = card.videoUrl;
        videoPlayer.load();
        videoModal.style.display = 'flex';
        videoModal.setAttribute('aria-hidden', 'false');
        videoPlayer.focus();
        videoPlayer.play();
      }
    } else {
      sendToBack(card.id);
    }
  };

  return (
    <div
      className="stack-container"
      style={{
        width: cardDimensions.width,
        height: cardDimensions.height,
      }}
    >
      {cards.map((card, index) => {
        const randomRotate = randomRotation ? Math.random() * 10 - 5 : 0;
        const isVideo = card.type === 'video';

        return (
          <CardRotate key={card.id} onSendToBack={() => sendToBack(card.id)} sensitivity={sensitivity}>
            <motion.div
              className="card"
              onClick={() => handleCardClick(card)}
              animate={{
                rotateZ: (cards.length - index - 1) * 4 + randomRotate,
                scale: 1 + index * 0.06 - cards.length * 0.06,
                transformOrigin: '90% 90%'
              }}
              initial={false}
              transition={{
                type: 'spring',
                stiffness: animationConfig.stiffness,
                damping: animationConfig.damping
              }}
              style={{
                width: cardDimensions.width,
                height: cardDimensions.height
              }}
            >
              <img src={card.img} alt={`Imagen historia ${card.id}`} className="card-image" />
              {isVideo && (
                <div className="play-icon-overlay">
                  <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
                </div>
              )}
            </motion.div>
          </CardRotate>
        );
      })}
    </div>
  );
}

export default Stack;

// --- Lógica para el Modal de Video del Stack ---
// This logic should be ideally placed in a useEffect hook or a separate component
// but for now we will leave it here to ensure functionality is not broken.
const videoModal = document.getElementById('video-modal-stack');
if (videoModal) {
    const closeBtn = videoModal.querySelector('.modal-close-btn');
    const videoPlayer = document.getElementById('stack-video-player');

    const closeModal = () => {
        videoModal.style.display = 'none';
        videoModal.setAttribute('aria-hidden', 'true');
        if (videoPlayer) {
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
        }
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    videoModal.addEventListener('click', (event) => {
        if (event.target === videoModal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && videoModal.style.display !== 'none') {
            closeModal();
        }
    });
}
