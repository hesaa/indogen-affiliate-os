import { useState } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { Link, ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface LinkStatProps {
  slug: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  createdAt: string;
  onCopy: () => void;
}

export function LinkStat({
  slug,
  clicks,
  conversions,
  conversionRate,
  createdAt,
  onCopy,
}: LinkStatProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">
            {slug}
          </h3>
          <p className="text-xs text-muted-foreground">
            Created {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          disabled={isCopied}
        >
          {isCopied ? 'Copied!' : 'Copy'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Clicks</p>
          <p className="text-lg font-semibold text-primary">
            {formatNumber(clicks)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Conversions</p>
          <p className="text-lg font-semibold text-primary">
            {formatNumber(conversions)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-primary" />
          <span className="text-sm font-medium">
            {conversionRate.toFixed(1)}% Conversion Rate
          </span>
        </div>
        <Badge variant={conversionRate >= 5 ? 'default' : 'secondary'}>
          {conversionRate >= 5 ? 'Good' : 'Needs Work'}
        </Badge>
      </div>
    </Card>
  );
}