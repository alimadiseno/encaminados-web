-- Encaminados — datos iniciales
-- Correr DESPUÉS de 0001_init.sql. Carga el mismo contenido que hoy vive en
-- data/retreats.ts, para que la migración a Supabase parta desde el mismo
-- punto (incluyendo los textos "[Pendiente: ...]" que el cliente aún no confirma).

do $$
declare
  v_retreat_id uuid;
begin
  insert into retreats (
    slug, nombre, bajada, lugar, como_llegar, mapa_url,
    hora_inicio, hora_termino, costo, incluye, cuotas_disponibles,
    cupos, cupos_descripcion, inscripcion_url,
    whatsapp, whatsapp_mensaje, email,
    guias_intro, historia_texto, historia_pendiente,
    hero_imagen_url, section_divider_imagen_url, historia_imagen_url
  ) values (
    '2026-segundo-semestre',
    'Encaminados',
    'Un fin de semana para volver a caminar juntos.',
    'Centro de Espiritualidad de Lo Vásquez',
    'Al lado del Santuario de Lo Vásquez, camino a Viña del Mar, pasado Casablanca. Cerca de una hora desde Santiago.',
    'https://www.google.com/maps/search/?api=1&query=Santuario+de+Lo+V%C3%A1squez',
    '19:00 del viernes',
    '12:30 del domingo',
    '$180.000 por matrimonio',
    'alojamiento, sábanas, materiales y todas las comidas',
    true,
    'Cupos Limitados',
    'Para asegurar un espacio íntimo y de calidad para cada pareja, trabajamos con grupos reducidos.',
    'https://docs.google.com/forms/d/e/1FAIpQLSf9D6pJ4g1i8D4hG951h7mHcEVqYtKsrczb5LJnE4xtU76G-w/viewform',
    '+56 9 9359 5766',
    'Hola, tenemos una duda sobre Encaminados.',
    'gvicuna@lcred.org',
    '[Texto pendiente de confirmar con el cliente: quiénes son las personas que guían el retiro, cuál es su rol, y qué se puede esperar de ellos.]',
    '[Texto pendiente de entrega por el cliente. Extensión objetivo: 200–300 palabras, tono narrativo en primera persona plural, contado como se lo contarían a un amigo en la mesa: quiénes fueron los primeros matrimonios, qué los movió a armar el primer fin de semana, y qué pasó después.]',
    true,
    '/images/hero-bg.webp',
    '/images/section-divider.webp',
    '/images/historia.webp'
  )
  returning id into v_retreat_id;

  insert into retreat_fechas (retreat_id, orden, label, fecha_inicio, fecha_termino) values
    (v_retreat_id, 0, '2 al 4 de octubre', '2026-10-02', '2026-10-04'),
    (v_retreat_id, 1, '6 al 8 de noviembre', '2026-11-06', '2026-11-08');

  insert into retreat_ideas (retreat_id, orden, titulo, descripcion) values
    (v_retreat_id, 0, 'Para los dos', 'Se participa en matrimonio, de principio a fin. Un espacio diseñado exclusivamente para reencontrarse en lo íntimo.'),
    (v_retreat_id, 1, 'Sin currículum previo', 'No hay que saber nada ni haber hecho nada antes. El retiro te recibe exactamente donde tu matrimonio se encuentra hoy.'),
    (v_retreat_id, 2, 'Fuera de todo', 'Del viernes en la tarde al domingo al mediodía. Sin niños, sin pantallas, sin pendientes. Tres días para lo verdaderamente importante.');

  insert into retreat_videos (retreat_id, orden, nombre, cita, youtube_id) values
    (v_retreat_id, 0, 'María y José', 'Definitivamente hay un antes y un después; un verdadero punto de inflexión.', null),
    (v_retreat_id, 1, 'Ana y Pedro', 'Una experiencia realmente mágica; momentos para estar tranquilos, conversar y reconectar.', null),
    (v_retreat_id, 2, 'Claudia y Diego', 'Es una oportunidad para volver a enfocar prioridades, reconectar en pareja y estar un rato con Dios.', null);

  insert into retreat_guias (retreat_id, orden, nombre, rol, foto_url, foto_forma) values
    (v_retreat_id, 0, '[Pendiente: nombre del sacerdote]', 'Director Espiritual', '/images/guia-sacerdote.webp', 'arco'),
    (v_retreat_id, 1, '[Pendiente: nombre del matrimonio guía]', 'Matrimonio Guía', '/images/guia-matrimonio.webp', 'circulo');

  insert into retreat_faq (retreat_id, orden, pregunta, respuesta, enlace_texto, enlace_href) values
    (v_retreat_id, 0, '¿Cuándo y dónde es?', 'Hay dos fechas este semestre y se elige una al momento de inscribirse.', null, null),
    (v_retreat_id, 1, '¿A qué hora llegamos y a qué hora terminamos?', 'Los esperamos el viernes y terminamos el domingo. Alcanzan a llegar a almorzar a la casa.', null, null),
    (v_retreat_id, 2, '¿Cómo llegamos?', 'Cada matrimonio llega por su cuenta. Al lado del Santuario de Lo Vásquez, camino a Viña del Mar, pasado Casablanca. Cerca de una hora desde Santiago.', 'Ver en el mapa', 'https://www.google.com/maps/search/?api=1&query=Santuario+de+Lo+V%C3%A1squez'),
    (v_retreat_id, 3, '¿Cuánto cuesta y qué incluye?', 'El cupo se reserva con una transferencia o con el link de pago, del total o de la mitad; también se puede pagar en cuotas. Si el costo es un problema, escríbannos antes: eso se conversa y se arregla.', null, null),
    (v_retreat_id, 4, '¿Cómo nos inscribimos?', 'Se completa un formulario por matrimonio y se reserva el cupo con el pago. El resto de los detalles les llega después por correo.', null, null),
    (v_retreat_id, 5, '¿Qué tenemos que llevar?', 'Ropa cómoda para tres días, y nada más. No hay que preparar nada, ni leer nada, ni traer nada especial. Vengan como están.', null, null),
    (v_retreat_id, 6, '¿Hay que participar de todo?', 'El fin de semana está pensado como una sola cosa de principio a fin y se disfruta mucho más así. Nadie los va a obligar a nada.', null, null),
    (v_retreat_id, 7, '¿Se puede ir sin mi cónyuge?', 'No. Encaminados es para los dos: casi todo lo que pasa ahí pasa entre ustedes.', null, null),
    (v_retreat_id, 8, '¿Qué pasa si no somos muy practicantes?', 'Nada. Van matrimonios de todo tipo y a nadie se le pregunta por eso. No hay que saber rezar, ni ir a misa, ni estar de acuerdo con todo. Basta con querer estar.', null, null),
    (v_retreat_id, 9, '¿Podemos llevar a los niños?', 'El fin de semana es solo para los dos. Vale la pena dejar todo organizado en la casa: son tres días para ustedes.', null, null);

  insert into retreat_photo_strip (retreat_id, orden, foto_url) values
    (v_retreat_id, 0, '/images/photo-strip-1.webp'),
    (v_retreat_id, 1, '/images/photo-strip-2.webp'),
    (v_retreat_id, 2, '/images/photo-strip-3.webp'),
    (v_retreat_id, 3, '/images/photo-strip-4.webp'),
    (v_retreat_id, 4, '/images/photo-strip-5.webp');
end $$;
