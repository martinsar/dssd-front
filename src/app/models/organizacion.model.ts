// [Entrega final] Organización (ONG) devuelta por GET /organizaciones
export interface Organizacion {
  id: number;
  nombre?: string | null;
  tipo?: string | null;
  objetoSocial?: string | null;
}
