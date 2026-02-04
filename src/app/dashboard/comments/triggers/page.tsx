"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, Search, Trash2, Loader2, MessageSquare } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import apiClient from '@/lib/api-client'
import { useToast } from '@/hooks/useToast'

interface Trigger {
  id: string;
  keyword: string;
  response: string;
  delaySeconds: number;
  isActive: boolean;
  createdAt: string;
}

export default function CommentTriggersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const toast = useToast()

  const [keywordFilter, setKeywordFilter] = useState('')
  const [newTrigger, setNewTrigger] = useState({
    keyword: '',
    response: '',
    delaySeconds: 30,
  })

  const { data, isLoading } = useQuery<{ triggers: Trigger[] }>({
    queryKey: ['comment-triggers'],
    queryFn: () => apiClient.get<any>('/api/comments/triggers'),
    enabled: !!user,
  })

  const triggers = data?.triggers || []

  const createTriggerMutation = useMutation({
    mutationFn: (trigger: any) => apiClient.post('/api/comments/triggers', trigger),
    onSuccess: () => {
      setNewTrigger({ keyword: '', response: '', delaySeconds: 30 })
      queryClient.invalidateQueries({ queryKey: ['comment-triggers'] })
      toast.success('Trigger created successfully')
    },
    onError: (err: any) => {
      toast.error('Failed to create trigger', err.message)
    }
  })

  const deleteTriggerMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/comments/triggers?id=${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comment-triggers'] })
      toast.success('Trigger deleted successfully')
    },
    onError: (err: any) => {
      toast.error('Failed to delete trigger', err.message)
    }
  })

  const filteredTriggers = triggers.filter(
    (trigger: Trigger) =>
      trigger.keyword.toLowerCase().includes(keywordFilter.toLowerCase()) ||
      trigger.response.toLowerCase().includes(keywordFilter.toLowerCase())
  )

  const handleCreateTrigger = async (e: React.FormEvent) => {
    e.preventDefault()
    createTriggerMutation.mutate(newTrigger)
  }

  const handleDeleteTrigger = async (id: string) => {
    if (confirm('Are you sure you want to delete this trigger?')) {
      deleteTriggerMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Auto-Reply Triggers</h1>
          <p className="text-slate-600">Automate engagement with custom keyword responses</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/comments/accounts')}
          className="flex items-center gap-2"
        >
          Manage Accounts
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">New Trigger</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTrigger} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="If comment contains..."
                placeholder="e.g., 'price' or 'link'"
                name="keyword"
                value={newTrigger.keyword}
                onChange={(e) =>
                  setNewTrigger((prev) => ({ ...prev, keyword: e.target.value }))
                }
                required
              />
              <Input
                label="Reply with..."
                placeholder="Your automated reply"
                name="response"
                value={newTrigger.response}
                onChange={(e) =>
                  setNewTrigger((prev) => ({ ...prev, response: e.target.value }))
                }
                required
              />
              <Input
                label="Delay (seconds)"
                type="number"
                name="delaySeconds"
                value={newTrigger.delaySeconds}
                onChange={(e) =>
                  setNewTrigger((prev) => ({
                    ...prev,
                    delaySeconds: parseInt(e.target.value) || 0,
                  }))
                }
                required
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={createTriggerMutation.isPending} className="text-white">
                {createTriggerMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Create Trigger
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg font-bold">Active Triggers</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search triggers..."
                value={keywordFilter}
                onChange={(e) => setKeywordFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTriggers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-slate-300" />
              </div>
              <p className="text-slate-500">No triggers found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTriggers.map((trigger) => (
                <div
                  key={trigger.id}
                  className="flex items-center justify-between p-4 border rounded-xl bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">"{trigger.keyword}"</span>
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {trigger.delaySeconds}s delay
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-500 truncate italic">
                      Reply: {trigger.response}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTrigger(trigger.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}