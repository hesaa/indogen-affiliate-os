import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DashboardLayout } from './layout'
import { useAuth } from '@/hooks/useAuth'
import { Clock, Film, MessageSquare, Link, TrendingUp, Users, Zap } from 'lucide-react'
import { RenderJobCard } from '@/components/dashboard/RenderJobCard'
import { LinkStat } from '@/components/dashboard/LinkStat'

export default function DashboardPage() {
  const { user, plan } = useAuth()
  const [recentJobs, setRecentJobs] = useState<any[]>([])
  const [topLinks, setTopLinks] = useState<any[]>([])

  // Mock data for demonstration - in production, this would come from API calls
  const stats = {
    renderJobs: 12,
    cloakedLinks: 8,
    commentTriggers: 5,
    landingPages: 3,
    totalClicks: 2847,
    totalConversions: 142
  }

  const quickActions = [
    {
      title: 'Create Render Job',
      description: 'Generate AI-powered video content with smart rotation',
      icon: Film,
      href: '/dashboard/render',
      color: 'bg-blue-500'
    },
    {
      title: 'Manage Cloaked Links',
      description: 'Create and track masked URLs with bot detection',
      icon: Link,
      href: '/dashboard/links',
      color: 'bg-green-500'
    },
    {
      title: 'Set Up Comment Sniper',
      description: 'Automate replies with keyword triggers and bio redirection',
      icon: MessageSquare,
      href: '/dashboard/comments',
      color: 'bg-purple-500'
    },
    {
      title: 'Generate Landing Page',
      description: 'Create micro-landing pages with social proof and urgency',
      icon: TrendingUp,
      href: '/dashboard/landing-pages',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your affiliate marketing tools and track performance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Render Jobs
              </CardTitle>
              <Clock className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">{stats.renderJobs}</p>
              <CardDescription className="text-xs text-slate-500">
                Active jobs in queue
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Cloaked Links
              </CardTitle>
              <Link className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">{stats.cloakedLinks}</p>
              <CardDescription className="text-xs text-slate-500">
                Links created
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Comment Triggers
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">{stats.commentTriggers}</p>
              <CardDescription className="text-xs text-slate-500">
                Active triggers
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Landing Pages
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">{stats.landingPages}</p>
              <CardDescription className="text-xs text-slate-500">
                Pages generated
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
              <CardHeader className="flex items-center justify-between mb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {action.title}
                </CardTitle>
                <action.icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 mb-3">{action.description}</p>
                <Button 
                  asChild
                  size="sm"
                  className={`${action.color} hover:bg-opacity-90 transition-colors`}
                >
                  <a href={action.href}>Go to {action.title}</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Render Jobs */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">
                Recent Render Jobs
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Last 3 jobs with status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentJobs.length === 0 ? (
                <p className="text-sm text-slate-400">No render jobs yet</p>
              ) : (
                recentJobs.slice(0, 3).map((job: any, index: number) => (
                  <RenderJobCard key={index} job={job} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Top Performing Links */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">
                Top Performing Links
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Click and conversion stats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topLinks.length === 0 ? (
                <p className="text-sm text-slate-400">No cloaked links yet</p>
              ) : (
                topLinks.slice(0, 3).map((link: any, index: number) => (
                  <LinkStat key={index} link={link} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Plan Benefits */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-600">
                Your Plan: {plan?.name || 'Starter'}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Features included
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-slate-600">
                <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                {plan?.maxRenderJobs || 5} concurrent render jobs
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Users className="h-4 w-4 mr-2 text-yellow-500" />
                {plan?.maxCloakedLinks || 10} cloaked links
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <MessageSquare className="h-4 w-4 mr-2 text-yellow-500" />
                Unlimited comment triggers
              </div>
              <Button 
                size="sm" 
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

DashboardPage.Layout = DashboardLayout