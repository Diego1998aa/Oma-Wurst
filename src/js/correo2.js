import { supabase } from './database.js';

document.addEventListener("DOMContentLoaded", function() {
    const contactForm = document.querySelector(".contact-form");
    
    if (!contactForm) {
        console.log("El formulario de contacto no se encontró.");
        return;
    }

    const submitBtn = contactForm.querySelector(".btn-submit");    

    // --- INICIO: Lógica del Modal de Confirmación ---

    const modal = document.getElementById('confirmation-modal');
    const modalContent = modal.querySelector('.confirmation-content');
    const modalIcon = modal.querySelector('.confirmation-icon');
    const modalTitle = document.getElementById('confirmation-title');
    const modalMessage = document.getElementById('confirmation-message');
    const modalCloseBtn = document.getElementById('confirmation-close-btn');

    const successIconSVG = `
        <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>`;

    const errorIconSVG = `
        <svg class="cross" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle class="cross-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="cross-path" fill="none" d="M16 16 36 36 M36 16 16 36"/>
        </svg>`;

    function showConfirmationModal(isSuccess, title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modalIcon.innerHTML = isSuccess ? successIconSVG : errorIconSVG;

        modalContent.classList.toggle('success', isSuccess);
        modalContent.classList.toggle('error', !isSuccess);

        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('visible');
        document.body.style.overflow = 'hidden'; // Evita el scroll del fondo
    }

    function hideConfirmationModal() {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('visible');
        document.body.style.overflow = ''; // Restaura el scroll

        // Reactivar el botón después de cerrar el modal
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Mensaje';
    }

    // --- FIN: Lógica del Modal de Confirmación ---

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        const formData = new FormData(contactForm);
        const contactData = {
            nombre: formData.get("name"),    
            correo: formData.get("email"),  
            mensaje: formData.get("message")  
        };

        const { data, error } = await supabase
            .from('contactos') 
            .insert([contactData]);

        if (error) {
            console.error('Error desde Supabase:', error);
            showConfirmationModal(false, 'Error de Envío', 'Hubo un problema al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.');
        } else {
            console.log('Mensaje guardado en Supabase:', data);
            showConfirmationModal(true, '¡Mensaje Enviado!', 'Gracias por contactarnos. Te responderemos a la brevedad.');
            contactForm.reset();
        }
    });

    // Eventos para cerrar el modal
    modalCloseBtn.addEventListener('click', hideConfirmationModal);
    modal.addEventListener('click', (e) => {
        // Cierra el modal si se hace clic en el fondo oscuro
        if (e.target === modal) {
            hideConfirmationModal();
        }
    });
});
