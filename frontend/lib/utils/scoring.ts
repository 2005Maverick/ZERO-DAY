// Scoring logic for predictions

export interface ScoreBreakdown {
    directionScore: number     // 0 or 50
    magnitudeScore: number     // 0 to 50
    confidenceBonus: number    // negative or positive adjustment
    totalXp: number            // (dir + mag + conf) * 1.5
    isCorrectDirection: boolean
}

export function calculateScore(
    predictedDirection: 'up' | 'down' | 'flat',
    predictedMagnitude: number,
    confidence: number, // 1 to 5
    actualDirection: 'up' | 'down' | 'flat',
    actualMagnitude: number
): ScoreBreakdown {
    // 1. Direction (50 pts if correct)
    const isCorrectDirection = predictedDirection === actualDirection
    const directionScore = isCorrectDirection ? 50 : 0

    // 2. Magnitude (up to 50 pts)
    // Only award magnitude points if direction was generally correct or flat
    // If they said UP 20% and it went DOWN 90%, they get 0 magnitude.
    let magnitudeScore = 0
    if (isCorrectDirection || predictedDirection === 'flat') {
        const diff = Math.abs(predictedMagnitude - actualMagnitude)
        // If within 50%, you get some points. 0% diff = 50 pts, 50% diff = 10 pts, >60% diff = 0 pts
        magnitudeScore = Math.max(0, 50 - diff * 0.8)
    }

    // 3. Confidence Bonus
    // 1-2 stars = low (+5 if right), 3 stars = medium (+0), 4-5 stars = high (+20 if right, -10 if wrong)
    let confidenceBonus = 0
    if (isCorrectDirection) {
        if (confidence >= 4) confidenceBonus = 20
        else if (confidence <= 2) confidenceBonus = 5
    } else {
        if (confidence >= 4) confidenceBonus = -10
        // No penalty for being wrong with low confidence
    }

    // 4. Total XP
    const baseTotal = Math.max(0, directionScore + magnitudeScore + confidenceBonus)
    const totalXp = Math.round(baseTotal * 1.5) // Score multiplier applied to all points

    return {
        directionScore,
        magnitudeScore: Math.round(magnitudeScore),
        confidenceBonus,
        totalXp,
        isCorrectDirection
    }
}
