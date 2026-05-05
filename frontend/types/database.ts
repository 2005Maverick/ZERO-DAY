// ===================
// USER TYPES
// ===================

export interface Profile {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    knowledge_level: 'beginner' | 'intermediate' | 'expert' | null
    created_at: string
    updated_at: string
}

export interface UserStats {
    user_id: string
    current_streak: number
    longest_streak: number
    last_activity_date: string | null
    total_xp: number
    current_level: number
    scenarios_completed: number
    total_time_spent: number
    average_accuracy: number
}

// ===================
// SCENARIO TYPES
// ===================

export interface Scenario {
    id: string
    title: string
    slug: string
    ticker: string
    event_date: string
    category: string
    difficulty: number
    estimated_minutes: number
    description: string | null
    briefing_content: BriefingCard[]
    chart_data: ChartData
    news_items: NewsItem[]
    outcome_data: OutcomeData
    learning_points: string[]
    level: number
    order_in_level: number
    is_active: boolean
}

export interface BriefingCard {
    type: 'text' | 'headline' | 'data' | 'mission'
    content: string
    subtext?: string
}

export interface ChartData {
    ohlcv: OHLCV[]
    event_index: number  // Which candle is "today"
}

export interface OHLCV {
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
}

export interface NewsItem {
    headline: string
    source: string
    timestamp: string
    content?: string
    reveal_at_minute?: number
}

export interface OutcomeData {
    direction: 'up' | 'down' | 'neutral'
    magnitude_percent: number
    future_ohlcv: OHLCV[]
    explanation: string
}

// ===================
// PROGRESS TYPES
// ===================

export interface UserProgress {
    id: string
    user_id: string
    scenario_id: string
    prediction_direction: 'up' | 'down' | 'neutral'
    prediction_magnitude: number
    confidence_level: number
    user_analysis: string | null
    score: number
    accuracy_score: number
    time_spent_seconds: number
    completed_at: string
}

// ===================
// ACHIEVEMENT TYPES
// ===================

export interface Achievement {
    id: string
    name: string
    description: string
    icon: string
    category: string
    requirement: AchievementRequirement
    xp_reward: number
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

export interface AchievementRequirement {
    type: 'streak' | 'scenarios_completed' | 'accuracy' | 'xp' | 'special'
    value: number
}

export interface UserAchievement {
    id: string
    user_id: string
    achievement_id: string
    unlocked_at: string
}

// ===================
// PREDICTION TYPES
// ===================

export interface Prediction {
    direction: 'up' | 'down' | 'neutral'
    magnitude: number  // percentage
    confidence: number // 1-100
    analysis?: string
}

// ===================
// UI STATE TYPES
// ===================

export type GamePhase = 'briefing' | 'gameplay' | 'prediction' | 'reveal' | 'results'

export interface GameState {
    phase: GamePhase
    scenario: Scenario | null
    elapsedSeconds: number
    newsRevealed: number[]
    prediction: Prediction | null
}
