import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";

console.log("INFO: Función iniciándose...");

// Obtenemos la API Key desde los secretos
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const CORREO_DESTINO = Deno.env.get("DESTINATION_EMAIL");

// LOG 1: Verificamos si las variables de entorno existen
if (!RESEND_API_KEY) {
  console.error("ERROR CRÍTICO: El secreto RESEND_API_KEY no fue encontrado.");
} else {
  console.log("INFO: Secreto RESEND_API_KEY cargado correctamente.");
}

if (!CORREO_DESTINO) {
  console.error("ERROR CRÍTICO: El secreto DESTINATION_EMAIL no fue encontrado.");
}

const resend = new Resend(RESEND_API_KEY!);
const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? "";

serve(async (req) => {
  try {
    console.log("INFO: Petición recibida, procesando...");
    const { record } = await req.json();

    // LOG 2: Verificamos si recibimos los datos del formulario
    if (!record) {
      console.error("ERROR: No se recibió el 'record' del webhook.");
      return new Response(JSON.stringify({ error: "No se recibió 'record'." }), { status: 400 });
    }
    console.log("INFO: Datos recibidos del formulario:", JSON.stringify(record));

    const nombre = record.nombre;
    const correoUsuario = record.correo;
    const mensaje = record.mensaje;

    // LOG 3: Justo antes de intentar enviar el correo
    console.log(`INFO: Intentando enviar correo a ${CORREO_DESTINO}...`);

    const { data, error } = await resend.emails.send({
      from: 'Contacto Oma Wurst <onboarding@resend.dev>',
      to: [CORREO_DESTINO!], // Usamos '!' porque ya verificamos que existe
      subject: `Nuevo Contacto desde la Web: ${nombre}`,
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <div style="background-color: #c0232a; color: #ffffff; padding: 25px; text-align: center;">
            <img src="${SUPABASE_URL}/storage/v1/object/public/assets/logo-oma-final.png" alt="Oma Wurst Logo" style="max-width: 150px; margin-bottom: 10px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Nuevo Mensaje desde tu Web</h1>
          </div>
          <div style="padding: 30px; line-height: 1.6;">
            <h2 style="color: #333333; border-bottom: 2px solid #eeeeee; padding-bottom: 10px;">Detalles del Contacto</h2>
            <div style="margin-bottom: 20px; font-size: 16px;">
              <p style="margin: 8px 0; color: #555;"><strong>Nombre:</strong> ${nombre}</p>
              <p style="margin: 8px 0; color: #555;"><strong>Correo Electrónico:</strong> <a href="mailto:${correoUsuario}" style="color: #c0232a; text-decoration: none;">${correoUsuario}</a></p>
            </div>
            <h2 style="color: #333333; border-bottom: 2px solid #eeeeee; padding-bottom: 10px;">Mensaje Recibido</h2>
            <div style="background-color: #f9f9f9; border-left: 4px solid #c0232a; padding: 15px; margin-top: 10px; border-radius: 4px;">
              <p style="margin: 0; color: #333; white-space: pre-wrap; font-style: italic;">${mensaje}</p>
            </div>
          </div>
          <div style="background-color: #333333; color: #cccccc; text-align: center; padding: 15px; font-size: 12px;">
            <p style="margin: 0;">Este es un correo automático enviado desde el formulario de contacto de oma-wurst.cl</p>
          </div>
        </div>
      </div>
      `,
    });

    // LOG 4 (ERROR): Si Resend devuelve un error, lo veremos aquí
    if (error) {
      console.error("ERROR DETALLADO DE RESEND:", JSON.stringify(error, null, 2));
      return new Response(JSON.stringify(error), { status: 400 });
    }

    // LOG 5 (ÉXITO): Si el correo se envía, lo veremos aquí
    console.log("ÉXITO: Correo enviado. Respuesta de Resend:", JSON.stringify(data));
    return new Response(JSON.stringify(data), { status: 200 });

  } catch (e) {
    console.error("ERROR INESPERADO EN LA FUNCIÓN:", e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
