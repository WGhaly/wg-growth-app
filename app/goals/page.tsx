import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getGoals } from '@/actions/goals'
import { GoalsClient } from '@/components/goals/GoalsClient'
import { PageContainer } from '@/components/ui/Navigation'

export default async function GoalsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/login')
  }

  const result = await getGoals()
  const goals = result.success ? result.goals : []

  return (
    <PageContainer>
      <GoalsClient initialGoals={goals} />
    </PageContainer>
  )
}
