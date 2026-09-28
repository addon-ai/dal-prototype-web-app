// Categorias de pasos en lenguaje de negocio. `tag` es la etiqueta corta que se ve en cada
// paso del lienzo: el significado no depende solo del color (icono + etiqueta + forma del chip).
export const CATEGORIES = Object.freeze([
  { id: 'ai', label: 'Inteligencia', tag: 'IA', chipRadius: 7 },
  { id: 'data', label: 'Información y sistemas', tag: 'Datos', chipRadius: 11 },
  { id: 'control', label: 'Reglas y seguridad', tag: 'Control', chipRadius: 3 },
  { id: 'person', label: 'Personas y avisos', tag: 'Persona', chipRadius: 11 },
]);

export function getCategory(id) {
  return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[0];
}
