import { Activity, Dna, Droplet, Eye, Flower2, HeartPulse, PenTool, Sparkles, Syringe, Wind, Zap } from 'lucide-react'

const icons = { Activity, Dna, Droplet, Eye, Flower2, HeartPulse, PenTool, Sparkles, Syringe, Wind, Zap }

export default function Icon({ name, ...props }) {
  const C = icons[name] ?? Sparkles
  return <C {...props} />
}
