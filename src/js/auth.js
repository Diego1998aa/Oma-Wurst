const registerForm = document.getElementById('register-form');
const messageDiv = document.getElementById('message');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Obtener los datos del formulario
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const company_name = document.getElementById('company_name').value;
    const contact_name = document.getElementById('contact_name').value;
    const phone = document.getElementById('phone').value;
    const tax_id = document.getElementById('tax_id').value;

    // Mostrar mensaje de procesando
    messageDiv.textContent = 'Registrando...';
    messageDiv.style.color = 'black';

    // Usar el cliente de Supabase definido en database.js
    const { data, error } = await window.supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                company_name: company_name,
                contact_name: contact_name,
                phone: phone,
                tax_id: tax_id
            }
        }
    });

    if (error) {
        messageDiv.textContent = `Error: ${error.message}`;
        messageDiv.style.color = 'red';
    } else {
        messageDiv.textContent = '¡Registro exitoso! Por favor, revisa tu correo para confirmar tu cuenta.';
        messageDiv.style.color = 'green';
        registerForm.reset();
    }
});
