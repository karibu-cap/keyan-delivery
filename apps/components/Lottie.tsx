import React from 'react'
import { useLottie } from 'lottie-react'

interface LottieProps {
    src: string | object
    className?: string
    loop?: boolean
    autoplay?: boolean
}

const Lottie: React.FC<LottieProps> = ({
    src,
    className = 'w-16',
    loop = true,
    autoplay = true
}) => {
    const options = {
        animationData: typeof src === 'object' ? src : undefined,
        path: typeof src === 'string' ? src : undefined,
        loop,
        autoplay
    }

    const { View } = useLottie(options)
    return <div className={className}>{View}</div>
}

export default Lottie