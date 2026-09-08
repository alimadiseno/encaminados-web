import { crearSesionPorClave, leerVariableDeEntorno } from "@/lib/session-auth";

export const { haySesionValida, iniciarSesion, cerrarSesion } = crearSesionPorClave({
  cookieName: "admin_sesion",
  leerClave: () => leerVariableDeEntorno("ADMIN_PASSWORD"),
});
