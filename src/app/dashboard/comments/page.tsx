import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Zap, Users, MessageSquare, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function CommentDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleScanNow = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/comments/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      if (response.ok) {
        // Scan triggered successfully
      } else {
        throw new Error('Failed to trigger scan');
      }
    } catch (error) {
      console.error('Scan error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comment Sniper</h1>
          <p className="mt-2 text-slate-600">
            Automate responses to comments with keyword triggers and manage your social accounts.
          </p>
        </div>
        <Button
          onClick={handleScanNow}
          disabled={isLoading}
          className="h-10"
          startIcon={<Zap className="h-4 w-4" />}
        >
          {isLoading ? 'Scanning...' : 'Scan Now'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Active Triggers</CardTitle>
            <CardDescription className="text-xs text-slate-500">Keyword-triggered replies</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">12</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Connected Accounts</CardTitle>
            <CardDescription className="text-xs text-slate-500">Social media profiles</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">3</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Auto-Replies Sent</CardTitle>
            <CardDescription className="text-xs text-slate-500">Lifetime count</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">842</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Conversion Rate</CardTitle>
            <CardDescription className="text-xs text-slate-500">Bio/DM clicks</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">18.5%</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Trigger Management
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Set up keyword triggers and auto-reply templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Create automated responses that trigger when specific keywords are detected in comments.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push('/dashboard/comments/triggers')}
                className="flex-1"
                startIcon={<Plus className="h-4 w-4" />}
              >
                Create Trigger
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/comments/triggers')}
                className="flex-1"
              >
                View All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Account Connections
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Connect your social media accounts for monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">
              Link your TikTok and Instagram accounts to enable comment monitoring and auto-replies.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => router.push('/dashboard/comments/accounts')}
                className="flex-1"
                startIcon={<Plus className="h-4 w-4" />}
              >
                Connect Account
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/comments/accounts')}
                className="flex-1"
              >
                Manage Accounts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Status
          </CardTitle>
          <CardDescription className="text-sm text-slate-500">
            Current comment sniper system health
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Comment Scanner</span>
            <Badge variant="default">Active</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Auto-Reply Engine</span>
            <Badge variant="default">Running</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Social Account Sync</span>
            <Badge variant="default">Up to date</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}