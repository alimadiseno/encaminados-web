"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAdmin, type LoginState } from "@/app/admin/actions";
import Logo from "@/components/Logo";

const estadoInicial: LoginState = {};

export default function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, estadoInicial);

  return (
    <section className="flex min-h-[100svh] items-center justify-center bg-lavender px-6 py-16">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-8 rounded-[24px] bg-cream px-8 py-10 text-center shadow-[0_1px_2px_rgba(21,16,14,.06)] sm:px-10">
        <Logo className="h-[39px] w-auto text-terracotta" />

        <div className="flex flex-col items-center gap-3">
          <h1 className="h2-section text-ink">Panel de administración</h1>
          <p className="text-base leading-[1.6] text-ink">
            Ingresa la clave de administración para editar el contenido del sitio.
          </p>
        </div>

        <form action={formAction} className="flex w-full flex-col items-stretch gap-4">
          <input
            type="password"
            name="password"
            placeholder="Clave de acceso"
            required
            autoFocus
            className="w-full rounded-full border-2 border-ink/15 bg-cream px-6 py-3.5 text-center text-base text-ink outline-none placeholder:text-ink/40 focus-visible:border-terracotta"
          />

          {state.error && <p className="text-sm font-semibold text-rose-700">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-terracotta px-8 py-3.5 text-sm font-bold tracking-[0.14em] text-peach uppercase no-underline transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <Link href="/" className="text-sm text-ink underline underline-offset-2">
          ← Volver al sitio de Encaminados
        </Link>
      </div>
    </section>
  );
}
