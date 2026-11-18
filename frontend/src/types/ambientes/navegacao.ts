import type {ReferenciaRes} from '@/types/ambientes/referencia'

/** Estado enviado via `location.state` na descida Campus → Unidade → Bloco. */
export interface CatalogoNavState {
    campus?: ReferenciaRes
    unidade?: ReferenciaRes
}
