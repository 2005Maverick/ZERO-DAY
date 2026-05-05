import type { PortfolioScenario } from '@/types/portfolio'
import { COVID_CRASH_SCENARIO } from './covid-crash'

export const PORTFOLIO_SCENARIOS: PortfolioScenario[] = [
  COVID_CRASH_SCENARIO,
]

export function getPortfolioScenario(slug: string): PortfolioScenario | undefined {
  return PORTFOLIO_SCENARIOS.find(s => s.slug === slug)
}
