import React, { useEffect, useRef } from 'react'
import LottieReact from 'lottie-react'

interface LottieProps {
    src: string | object
    assetPath?: string
    className?: string
    loop?: boolean
    autoplay?: boolean
    speed?: number
}

const Lottie: React.FC<LottieProps> = ({
    src,
    assetPath,
    className = 'w-16',
    loop = true,
    autoplay = true,
    speed = 1
}) => {

    const lottieRef = useRef<any>(null);

    useEffect(() => {
        if (lottieRef.current && speed != 1) {
            lottieRef.current.setSpeed(speed)
        }
        return;
    }, [speed]
    )
    return <LottieReact lottieRef={lottieRef} className={className} animationData={src} assetsPath={assetPath} loop={loop} autoplay={autoplay} />
}

export default Lottie