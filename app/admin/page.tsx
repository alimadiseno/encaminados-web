import type { Metadata } from "next";
import { haySesionValida } from "@/lib/admin-auth";
import { getRetreatBySlug, getRetiros, RETIRO_DESTACADO } from "@/data/retreats";
import { getInscritos, getInscritosArchivados } from "@/lib/inscritos";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import RetreatEditor from "@/components/admin/RetreatEditor";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Panel de administración · Encaminados",
    robots: { index: false, follow: false },
  };
}

/**
 * El contenido siempre edita el retiro destacado; `?retiro=<slug>` solo
 * cambia qué ciclo se ve en Inscritos (para revisar ciclos anteriores).
 */
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const autenticado = await haySesionValida();
  if (!autenticado) return <AdminLoginForm />;

  const retreat = await getRetreatBySlug(RETIRO_DESTACADO);
  if (!retreat) {
    return (
      <p style={{ padding: 40 }}>
        No se encontró el retiro &quot;{RETIRO_DESTACADO}&quot; en Supabase.
      </p>
    );
  }

  const { retiro } = await searchParams;
  const slugPedido = typeof retiro === "string" ? retiro : undefined;
  const retiroInscritos =
    slugPedido && slugPedido !== retreat.slug ? ((await getRetreatBySlug(slugPedido)) ?? retreat) : retreat;

  const [inscritos, inscritosArchivados, retiros] = await Promise.all([
    getInscritos(retiroInscritos.id),
    getInscritosArchivados(retiroInscritos.id),
    getRetiros(),
  ]);

  return (
    <RetreatEditor
      retreat={retreat}
      retiroInscritos={retiroInscritos}
      retiros={retiros}
      inscritos={inscritos}
      inscritosArchivados={inscritosArchivados}
      vistaInicial={slugPedido ? "inscritos" : "contenido"}
    />
  );
}
