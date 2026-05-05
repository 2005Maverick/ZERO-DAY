'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { StoredUser, getUser, saveUser } from '@/lib/utils/localStorage'

interface UserContextType {
    user: StoredUser | null;
    setUser: (user: StoredUser | null) => void;
    clearUser: () => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<StoredUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
        // Load user from localStorage on mount
        const stored = getUser()
        if (stored) {
            setUserState(stored)
        }
        setIsLoading(false)
    }, [])

    const setUser = (newUser: StoredUser | null) => {
        setUserState(newUser)
        if (newUser) {
            saveUser(newUser)
        } else {
            localStorage.removeItem('zdm_user_v2')
        }
    }

    const clearUser = () => {
        setUser(null)
    }

    return (
        <UserContext.Provider value={{ user, setUser, clearUser, isLoading }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
