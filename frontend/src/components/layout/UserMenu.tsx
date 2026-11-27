import {Avatar, AvatarFallback} from '@/components/ui/avatar'
import {Button} from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import {RoleBadge} from '@/components/usuarios/RoleBadge'
import {useAuth} from '@/hooks/useAuth'

function iniciais(nome: string): string {
    return nome
        .split(' ')
        .filter(Boolean)
        .map((parte) => parte[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
}

/**
 * Identificação do usuário no Header (arquitetura-frontend.md §15.6):
 * avatar → Sheet à direita no mobile (<md) e DropdownMenu no desktop (≥md).
 * Os dois triggers coexistem no DOM; a visibilidade é resolvida por CSS.
 */
export function UserMenu() {
    const {user, logout} = useAuth()
    if (!user) return null

    return (
        <>
            {/* Mobile: avatar → Sheet à direita */}
            <Sheet>
                <SheetTrigger
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full md:hidden"
                    aria-label="Abrir perfil"
                >
                    <Avatar className="size-10">
                        <AvatarFallback>{iniciais(user.nome)}</AvatarFallback>
                    </Avatar>
                </SheetTrigger>
                <SheetContent side="right" className="data-[side=right]:w-[280px]">
                    <SheetHeader>
                        <SheetTitle>{user.nome}</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4 px-4">
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex flex-wrap gap-1">
                            {user.perfis.map((perfil) => (
                                <RoleBadge key={perfil} role={perfil}/>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            className="min-h-11 w-full"
                            onClick={() => void logout()}
                        >
                            Sair
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Desktop: avatar → DropdownMenu */}
            <DropdownMenu>
                <DropdownMenuTrigger
                    className="hidden items-center justify-center rounded-full md:inline-flex"
                    aria-label="Abrir perfil"
                >
                    <Avatar className="size-8">
                        <AvatarFallback>{iniciais(user.nome)}</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{user.nome}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuItem onClick={() => void logout()}>Sair</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
