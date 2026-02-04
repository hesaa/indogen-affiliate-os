'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2, Check } from 'lucide-react';

type Plan = 'starter' | 'pro' | 'empire';

interface PlanFeature {
  name: string;
  included: boolean;
  proOnly?: boolean;
  empireOnly?: boolean;
}

const PLAN_FEATURES: Record<Plan, PlanFeature[]> = {
  starter: [
    { name: 'Smart Content Rotator', included: true },
    { name: 'Basic Comment Sniper', included: true, proOnly: true },
    { name: 'Advanced Link Cloaker', included: true, proOnly: true },
    { name: 'Micro-Landing Pages', included: true, proOnly: true },
    { name: '5 Render Jobs/month', included: true },
    { name: '100 Cloaked Links', included: true },
    { name: 'Priority Support', included: false },
    { name: 'Custom Integrations', included: false },
  ],
  pro: [
    { name: 'Smart Content Rotator', included: true },
    { name: 'Automated Comment Sniper', included: true },
    { name: 'Advanced Link Cloaker', included: true },
    { name: 'Micro-Landing Pages', included: true },
    { name: '50 Render Jobs/month', included: true },
    { name: '1,000 Cloaked Links', included: true },
    { name: 'Priority Support', included: true },
    { name: 'Custom Integrations', included: false },
  ],
  empire: [
    { name: 'Smart Content Rotator', included: true },
    { name: 'Automated Comment Sniper', included: true },
    { name: 'Advanced Link Cloaker', included: true },
    { name: 'Micro-Landing Pages', included: true },
    { name: 'Unlimited Render Jobs', included: true },
    { name: 'Unlimited Cloaked Links', included: true },
    { name: 'Priority Support', included: true },
    { name: 'Custom Integrations', included: true },
  ],
};

const PLAN_PRICES: Record<Plan, { monthly: number; yearly: number }> = {
  starter: { monthly: 29, yearly: 290 },
  pro: { monthly: 79, yearly: 790 },
  empire: { monthly: 199, yearly: 1990 },
};

const PLAN_NAMES: Record<Plan, string> = {
  starter: 'Starter',
  pro: 'Pro',
  empire: 'Empire',
};

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan>('starter');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          plan: selectedPlan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Registration successful, redirect to login
      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const currentPrice = PLAN_PRICES[selectedPlan][billingCycle];
  const savings = billingCycle === 'yearly' ? 'Save 2 months' : '';

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-muted-foreground">
            Choose the plan that fits your affiliate marketing needs
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Plan Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBillingCycle('yearly')}
              >
                Yearly
                {savings && (
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    {savings}
                  </span>
                )}
              </Button>
            </div>

            <div className="grid gap-4">
              {(Object.keys(PLAN_NAMES) as Plan[]).map((plan) => (
                <Card
                  key={plan}
                  className={`cursor-pointer transition-all ${
                    selectedPlan === plan
                      ? 'border-primary ring-2 ring-primary'
                      : 'hover:border-muted-foreground/50'
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{PLAN_NAMES[plan]}</CardTitle>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          ${currentPrice}
                          <span className="text-sm font-normal text-muted-foreground">
                            /{billingCycle === 'yearly' ? 'yr' : 'mo'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <CardDescription>
                      {plan === 'starter' && 'Perfect for getting started'}
                      {plan === 'pro' && 'For growing affiliate teams'}
                      {plan === 'empire' && 'For agencies and enterprises'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {PLAN_FEATURES[plan].map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm">
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              feature.included
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                          <span
                            className={
                              feature.proOnly && selectedPlan !== 'pro'
                                ? 'text-muted-foreground/50 line-through'
                                : feature.empireOnly && selectedPlan !== 'empire'
                                ? 'text-muted-foreground/50 line-through'
                                : ''
                            }
                          >
                            {feature.name}
                          </span>
                          {feature.proOnly && selectedPlan !== 'pro' && (
                            <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs">
                              Pro
                            </span>
                          )}
                          {feature.empireOnly && selectedPlan !== 'empire' && (
                            <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs">
                              Empire
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>
                Enter your email and create a password to get started
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="••••••••"
                  />
                </div>

                <div className="rounded-md bg-muted p-4">
                  <div className="text-sm font-medium">Selected Plan: {PLAN_NAMES[selectedPlan]}</div>
                  <div className="text-sm text-muted-foreground">
                    ${currentPrice}/{billingCycle === 'yearly' ? 'year' : 'month'}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create {PLAN_NAMES[selectedPlan]} Account
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => router.push('/login')}
                  >
                    Sign in
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}