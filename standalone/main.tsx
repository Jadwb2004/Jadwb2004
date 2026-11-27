import { createRoot } from 'react-dom/client'
import { DirectorDashboard, type DirectorClient } from '@/components/director/dashboard'
import { localPlan, localRedirect } from '@/lib/director/local-director'

/** Standalone build: the built-in director runs right in the browser, no server. */
const browserDirector: DirectorClient = {
  plan: async (idea, memory) => ({ ...localPlan(idea, memory), provider: 'built-in' }),
  redirect: async (spec, notes) => ({ ...localRedirect(spec, notes), notes: [], provider: 'built-in' }),
  status: async () => 'built-in',
}

createRoot(document.getElementById('root')!).render(<DirectorDashboard director={browserDirector} canExport={false} />)
