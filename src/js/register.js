import { supabaseClient } from './database';

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const messageDiv = document.getElementById('message');

  if (!registerForm) {
    console.warn('⚠ No se encontró #register-form en esta página.');
    return;
  }

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email')?.value || '';
    const password = document.getElementById('password')?.value || '';
    const company_name = document.getElementById('company_name')?.value || '';
    const contact_name = document.getElementById('contact_name')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const tax_id = document.getElementById('tax_id')?.value || '';

    if (messageDiv) {
      messageDiv.textContent = 'Registrando...';
      messageDiv.style.color = 'black';
    }

    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name,
          contact_name,
          phone,
          tax_id,
        },
      },
    });

    if (error) {
      if (messageDiv) {
        messageDiv.textContent = `Error: ${error.message}`;
        messageDiv.style.color = 'red';
      }
    } else {
      if (messageDiv) {
        messageDiv.textContent = '¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta.';
        messageDiv.style.color = 'green';
      }
      registerForm.reset();
    }
  });
});
