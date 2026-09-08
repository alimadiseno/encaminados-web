"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cerrarSesion, iniciarSesion } from "@/lib/guias-auth";

export interface LoginState {
  error?: string;
}

export async function loginGuias(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const ok = await iniciarSesion(password);

  if (!ok) {
    return { error: "Clave incorrecta. Intenta de nuevo." };
  }

  revalidatePath("/guias");
  redirect("/guias");
}

export async function logoutGuias() {
  await cerrarSesion();
  revalidatePath("/guias");
  redirect("/guias");
}
