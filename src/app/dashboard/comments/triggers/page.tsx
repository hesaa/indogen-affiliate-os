import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api-client'
import { CommentTrigger } from '@/types'

export default function CommentTriggersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  const [keywordFilter, setKeywordFilter] = useState('')
  const [newTrigger, setNewTrigger] = useState({
    keyword: '',
    reply: '',
    delaySeconds: 30,
  })

  const { data: triggers = [], isLoading } = useQuery({
    queryKey: ['comment-triggers'],
    queryFn: () => apiClient.get<CommentTrigger[]>('/api/comments/triggers'),
  })

  const createTriggerMutation = useMutation({
    mutationFn: (trigger: Omit<CommentTrigger, 'id' | 'userId' | 'createdAt'>) =>
      apiClient.post('/api/comments/triggers', {
        ...trigger,
        userId: user?.id!,
      }),
    onSuccess: () => {
      setNewTrigger({ keyword: '', reply: '', delaySeconds: 30 })
      queryClient.invalidateQueries({ queryKey: ['comment-triggers'] })
    },
  })

  const deleteTriggerMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/comments/triggers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment-triggers'] })
    },
  })

  const filteredTriggers = triggers.filter(
    (trigger) =>
      trigger.keyword.toLowerCase().includes(keywordFilter.toLowerCase()) ||
      trigger.reply.toLowerCase().includes(keywordFilter.toLowerCase())
  )

  const handleCreateTrigger = async (e: React.FormEvent) => {
    e.preventDefault()
    await createTriggerMutation.mutateAsync(newTrigger)
  }

  const handleDeleteTrigger = async (id: string) => {
    if (confirm('Are you sure you want to delete this trigger?')) {
      await deleteTriggerMutation.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Auto-Reply Triggers</h1>
        <Button onClick={() => router.push('/dashboard/comments/accounts')}>
          Manage Accounts
        </Button>
      </div>

      <Card>
        <form onSubmit={handleCreateTrigger} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Keyword"
              placeholder="e.g., 'link in bio'"
              value={newTrigger.keyword}
              onChange={(e) =>
                setNewTrigger((prev) => ({ ...prev, keyword: e.target.value }))
              }
              required
            />
            <Input
              label="Reply Message"
              placeholder="Your automated reply"
              value={newTrigger.reply}
              onChange={(e) =>
                setNewTrigger((prev) => ({ ...prev, reply: e.target.value }))
              }
              required
            />
            <Input
              label="Delay (seconds)"
              type="number"
              placeholder="30"
              value={newTrigger.delaySeconds}
              onChange={(e) =>
                setNewTrigger((prev) => ({
                  ...prev,
                  delaySeconds: parseInt(e.target.value) || 30,
                }))
              }
              required
            />
          </div>
          <Button type="submit" className="w-full md:w-auto" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Trigger
          </Button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Active Triggers</h2>
          <Input
            icon={Search}
            placeholder="Search triggers..."
            value={keywordFilter}
            onChange={(e) => setKeywordFilter(e.target.value)}
            className="max-w-md"
          />
        </div>

        {filteredTriggers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No triggers configured</p>
        ) : (
          <div className="space-y-3">
            {filteredTriggers.map((trigger) => (
              <div
                key={trigger.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{trigger.keyword}</div>
                  <div className="text-sm text-gray-600">
                    {trigger.reply.substring(0, 50)}...
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {trigger.delaySeconds}s delay
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTrigger(trigger.id!)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}