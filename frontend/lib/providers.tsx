'use client'

import { ReactNode } from 'react'
import { NavigationProvider } from '@/lib/contexts/navigation-context'
import { UserProvider } from '@/lib/contexts/user-context'

export function Providers({ children }: { children: ReactNode }) {
    return (
        <UserProvider>
            <NavigationProvider>
                {children}
            </NavigationProvider>
        </UserProvider>
    )
}
