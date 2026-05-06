import type { MiniGame } from '../game-types'

export const BIAS_SPOTTER: MiniGame = {
  slug: 'market-psychology',
  title: 'Bias Spotter',
  tagline: 'Identify the cognitive bias behind 8 trading scenarios.',
  accentColor: 'A855F7',
  passThreshold: 0.7,
  rounds: [
    {
      id: 'bs1', kind: 'mcq',
      context: 'Scenario · 1 of 8',
      prompt: 'A trader buys RELIANCE at ₹1,400. It falls to ₹1,250. They refuse to sell, telling themselves it will "come back." Eventually it hits ₹1,100. Which bias is dominant here?',
      options: [
        { label: 'Loss aversion / disposition effect', correct: true, feedback: 'Yes. Losers hurt 2× more than equal gains feel good — so traders avoid realizing them.' },
        { label: 'Confirmation bias', correct: false, feedback: 'Different bias. Confirmation is filtering for evidence that confirms a view.' },
        { label: 'Recency bias', correct: false, feedback: 'Recency is overweighting the latest data, not refusing to take losses.' },
        { label: 'FOMO', correct: false, feedback: 'FOMO is fear of missing OUT, not refusing to exit a position.' },
      ],
      explanation: 'The disposition effect is the tendency to hold losers too long and sell winners too early. Pain of realizing a loss feels disproportionately worse than the gain.',
    },
    {
      id: 'bs2', kind: 'mcq',
      context: 'Scenario · 2 of 8',
      prompt: 'You see TCS spiking +8% pre-market on news of an AI deal. You buy ₹50,000 worth at ₹3,800 because "everyone is jumping in." It crashes back to ₹3,500 within an hour. Which bias?',
      options: [
        { label: 'FOMO (fear of missing out)', correct: true, feedback: 'Correct. Buying because others are buying, without your own thesis, is FOMO at its purest.' },
        { label: 'Anchoring', correct: false, feedback: 'Anchoring is fixating on a reference price — not the same as crowd-driven entry.' },
        { label: 'Survivorship bias', correct: false, feedback: 'Survivorship is overweighting visible winners — not relevant to entry timing.' },
        { label: 'Hindsight bias', correct: false, feedback: 'Hindsight applies after the fact — "I knew it all along."' },
      ],
      explanation: 'FOMO is most expensive at peaks. Crowd-driven trades have already priced in the move; you are paying retail for what someone else bought wholesale.',
    },
    {
      id: 'bs3', kind: 'mcq',
      context: 'Scenario · 3 of 8',
      prompt: 'You bought INDIGO at ₹1,200. It is now ₹1,180. You refuse to sell below ₹1,200 because "I will take a loss." You wait. It falls to ₹1,050. Which bias?',
      options: [
        { label: 'Anchoring (to your entry price)', correct: true, feedback: 'Yes. Your entry price is irrelevant to where the stock should go — but you anchored to it.' },
        { label: 'Sunk cost fallacy', correct: false, feedback: 'Close, but anchoring is the more precise term. Sunk cost is broader.' },
        { label: 'Overconfidence', correct: false, feedback: 'Overconfidence drives entry size, not exit hesitation.' },
        { label: 'Recency bias', correct: false, feedback: 'Recency would mean overweighting yesterday\'s price — different mechanism.' },
      ],
      explanation: 'Your entry price is a number only YOU care about. The market does not. Anchoring to it makes you treat ₹1,200 as a magic line that the stock "owes" you returning to.',
    },
    {
      id: 'bs4', kind: 'mcq',
      context: 'Scenario · 4 of 8',
      prompt: 'You read three bullish articles about HDFC and one bearish report. You skip the bearish one because "they are obviously wrong." You buy. Which bias?',
      options: [
        { label: 'Confirmation bias', correct: true, feedback: 'Exactly. You filtered evidence to confirm what you already believed.' },
        { label: 'Anchoring', correct: false, feedback: 'Anchoring is fixating on a number, not on a view.' },
        { label: 'Herd mentality', correct: false, feedback: 'Herd is following the crowd; this is filtering data to match your own view.' },
        { label: 'Loss aversion', correct: false, feedback: 'Loss aversion is about exits, not entry research.' },
      ],
      explanation: 'Confirmation bias is the most dangerous trading bias because it feels like research. The discipline is reading bear cases when you are bullish, and bull cases when you are bearish.',
    },
    {
      id: 'bs5', kind: 'mcq',
      context: 'Scenario · 5 of 8',
      prompt: 'After winning 3 trades in a row, you double your normal position size on the 4th because "I am on a roll." It loses badly. Which bias is at work?',
      options: [
        { label: 'Hot-hand fallacy / overconfidence', correct: true, feedback: 'Yes. Recent wins have no causal link to your next trade. Markets do not have memory.' },
        { label: 'Loss aversion', correct: false, feedback: 'Loss aversion is about avoiding losses, not increasing size after wins.' },
        { label: 'Anchoring', correct: false, feedback: 'No anchor here — different bias.' },
        { label: 'Recency bias', correct: false, feedback: 'Recency contributes, but the active bias is overconfidence from a hot streak.' },
      ],
      explanation: 'Each trade is independent. A 3-game win streak in a casino does not change next-roll odds. Same in markets. Discipline is sizing the same after a streak as before it.',
    },
    {
      id: 'bs6', kind: 'mcq',
      context: 'Scenario · 6 of 8',
      prompt: 'NIFTY just dropped 4%. Your friend says "this is the bottom, it always bounces in my experience." You buy aggressively. Within a week NIFTY drops another 6%. Which bias?',
      options: [
        { label: 'Recency bias / availability heuristic', correct: true, feedback: 'Right. "What I saw recently" gets weighted as universal truth.' },
        { label: 'Hindsight bias', correct: false, feedback: 'Hindsight is applied AFTER an event — different timeline.' },
        { label: 'Disposition effect', correct: false, feedback: 'Disposition is about exits, not entries.' },
        { label: 'Confirmation bias', correct: false, feedback: 'Close, but the lead bias here is recency — extrapolating from a few recent bounces.' },
      ],
      explanation: 'Sample size of "few recent bounces" tells you almost nothing about whether THIS drop will bounce. Recency bias makes recent patterns feel like rules.',
    },
    {
      id: 'bs7', kind: 'mcq',
      context: 'Scenario · 7 of 8',
      prompt: 'After NIFTY crashed 8% today, you log on Twitter and see successful day-traders posting "I shorted at the open, made 4×!" You feel awful. Which bias is the platform exploiting?',
      options: [
        { label: 'Survivorship bias', correct: true, feedback: 'Exactly. Twitter only shows winners. The 95% who got chopped up never tweet about it.' },
        { label: 'FOMO', correct: false, feedback: 'FOMO is a downstream effect — the root is survivorship distortion of the data you see.' },
        { label: 'Herd mentality', correct: false, feedback: 'Herd is following others; survivorship is being shown a biased sample.' },
        { label: 'Hindsight bias', correct: false, feedback: 'Hindsight is post-event "I knew it" — different.' },
      ],
      explanation: 'For every 1 winner you see online, hundreds of equally aggressive losers stay silent. Treat every screenshot as one data point in a hidden distribution.',
    },
    {
      id: 'bs8', kind: 'mcq',
      context: 'Scenario · 8 of 8',
      prompt: 'You take a ₹10,000 loss. Within minutes, you place a much larger trade trying to "make it back." Which bias is firing hardest?',
      options: [
        { label: 'Revenge trading / loss-chasing', correct: true, feedback: 'Yes. Emotion overriding plan, sizing up to recover. The single fastest path to a blown account.' },
        { label: 'Anchoring', correct: false, feedback: 'Indirect at best — the dominant pattern is emotional escalation.' },
        { label: 'Confirmation bias', correct: false, feedback: 'No — the trade isn\'t about confirming a view, it\'s about recovering money.' },
        { label: 'FOMO', correct: false, feedback: 'FOMO is forward-looking; this is about chasing a past loss.' },
      ],
      explanation: 'After a loss, walk away from the screen for at least 15 minutes. Your decision quality halves under emotional escalation. Pros enforce a "no trade for 30 min after a loss" rule.',
    },
  ],
}
