import { HTMLAttributes } from 'react'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={`
                animate-shimmer 
                bg-[linear-gradient(90deg,#111_0%,#1a1a1a_50%,#111_100%)] 
                bg-[length:200%_100%] 
                rounded-md 
                ${className || ''}
            `}
            {...props}
        />
    )
}
