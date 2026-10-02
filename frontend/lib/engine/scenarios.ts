import type { ScenarioDataset } from '@/lib/agents/types'
import { COV20_DATASET } from './cov20-dataset'

// Scenarios the agents can run on, by sessions.scenario_id. One entry until M4 (4.5).
export const SCENARIOS: Record<string, { dataset: ScenarioDataset; label: string }> = {
  'COV-20': { dataset: COV20_DATASET, label: 'Covid Day Zero: 9 March 2020, NSE (India)' },
}
