import type { PortfolioScenario } from '@/types/portfolio'
import { PORTFOLIO_STOCKS } from './stocks'
import { COVID_EVENTS, FLASH_CRASH } from './events'
import { COVID_RULES } from './rules'

export const COVID_CRASH_SCENARIO: PortfolioScenario = {
  slug: 'covid-crash-day-zero',
  title: 'The Covid Crash: Day Zero',
  subtitle: 'March 9, 2020 — The day markets broke',
  date: 'March 9, 2020',
  dateShort: 'Mar 9, 2020',
  difficulty: 2,
  description: 'Italy is in national lockdown. A Saudi-Russia oil war has erupted overnight. You have ₹1,00,000 and 8 minutes to navigate the most volatile trading day in a decade.',
  cinematicCopy: 'Italy locks down 16 million. Oil collapses 25%. Markets open in 60 seconds.',
  stocks: PORTFOLIO_STOCKS,
  events: COVID_EVENTS,
  flashCrash: FLASH_CRASH,
  startingCapital: 100000,
  causalRules: COVID_RULES,
}

export { PORTFOLIO_STOCKS, COVID_EVENTS, FLASH_CRASH, COVID_RULES }
