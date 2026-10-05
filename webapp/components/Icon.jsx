import { Activity, Dna, Droplet, Eye, Flower2, HeartPulse, PenTool, Sparkles, Syringe, Wind } from 'lucide-react'

const icons = { Activity, Dna, Droplet, Eye, Flower2, HeartPulse, PenTool, Sparkles, Syringe, Wind }

export default function Icon({ name, ...props }) {
  const C = icons[name] ?? Sparkles
  return <C {...props} />
}
