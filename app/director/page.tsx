import type { Metadata, Viewport } from 'next'
import { DirectorDashboard } from '@/components/director/dashboard'

export const metadata: Metadata = {
  title: 'AI Game Director',
  description: 'Type one sentence about a game. The director plans it, builds it, and remembers what worked.',
}

export const viewport: Viewport = {
  themeColor: '#09090b',
}

export default function DirectorPage() {
  return <DirectorDashboard />
}
