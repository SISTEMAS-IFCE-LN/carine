import {Link} from 'react-router'
import {HeaderNav} from '@/components/layout/HeaderNav'
import {UserMenu} from '@/components/layout/UserMenu'
import {useAuth} from '@/hooks/useAuth'
import {buttonVariants} from '@/components/ui/button'
import {PAGES_ROUTES} from '@/constants/routes'
import {SYSTEM_DESCRIPTION, SYSTEM_FULL_NAME, SYSTEM_NAME} from '@/constants/branding'
import {cn} from '@/lib/utils/cn'

export function Header() {
    const {user} = useAuth()

    return (
        <header className="border-b border-border bg-background">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        {user && <HeaderNav />}
                        <Link
                            to="/"
                            className="min-w-0"
                            aria-label={SYSTEM_FULL_NAME}
                            title={SYSTEM_FULL_NAME}
                        >
                            <span className="block font-bold text-xl leading-tight">
                                {SYSTEM_NAME}
                            </span>
                            <span className="block max-w-[14rem] text-[0.6rem] leading-tight text-muted-foreground sm:max-w-none sm:text-xs">
                                {SYSTEM_DESCRIPTION}
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <UserMenu/>
                        ) : (
                            <Link
                                to={PAGES_ROUTES.LOGIN}
                                className={cn(
                                    buttonVariants({variant: 'default', size: 'sm'}),
                                    'min-h-11 md:min-h-0',
                                )}
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}