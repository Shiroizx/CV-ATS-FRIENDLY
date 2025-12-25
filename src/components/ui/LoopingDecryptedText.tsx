import { useEffect, useState } from 'react';
import DecryptedText from './DecryptedText';

interface LoopingDecryptedTextProps {
    text: string;
    speed?: number;
    maxIterations?: number;
    className?: string;
    loopDelay?: number;
}

export default function LoopingDecryptedText({
    text,
    speed = 50,
    maxIterations = 15,
    className = '',
    loopDelay = 3000,
}: LoopingDecryptedTextProps) {
    const [key, setKey] = useState(0);

    useEffect(() => {
        const animationDuration = speed * maxIterations;
        const totalCycleDuration = animationDuration + loopDelay;

        const interval = setInterval(() => {
            setKey(prev => prev + 1);
        }, totalCycleDuration);

        return () => clearInterval(interval);
    }, [speed, maxIterations, loopDelay]);

    return (
        <DecryptedText
            key={key}
            text={text}
            animateOn="view"
            speed={speed}
            maxIterations={maxIterations}
            className={className}
        />
    );
}
