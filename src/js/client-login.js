import { supabaseClient } from './database';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');
  const loginButton = document.getElementById('login-button');

  if (!loginForm) {
    console.warn('⚠ No se encontró #login-form en la vista de clientes.');
    return;
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const email = emailInput?.value || '';
    const password = passwordInput?.value || '';

    loginButton.disabled = true;
    loginButton.textContent = 'Ingresando...';
    errorMessage.textContent = '';

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Error de inicio de sesión para cliente:', error.message);
        errorMessage.textContent = 'Email o contraseña incorrectos.';
      } else {
        window.location.href = 'index.html';
      }
    } catch (e) {
      console.error('No se pudo conectar con Supabase (cliente):', e);
      errorMessage.textContent = 'No se pudo conectar con el servidor.';
    } finally {
      loginButton.disabled = false;
      loginButton.textContent = 'Ingresar';
    }
  });
});
