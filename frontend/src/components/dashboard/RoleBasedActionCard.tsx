import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface RoleBasedActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  buttonText: string;
  gradient?: string;
  details?: string;
}

export function RoleBasedActionCard({
  title,
  description,
  icon: Icon,
  href,
  buttonText,
  gradient = 'from-blue-500 to-blue-600',
  details,
}: RoleBasedActionCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className={`bg-gradient-to-br ${gradient}/10 border-${gradient.split(' ')[1].replace('to-', '')}/20 hover:shadow-lg transition-all cursor-pointer`}
      onClick={() => navigate(href)}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {details && (
          <p className="text-sm text-muted-foreground mb-4">{details}</p>
        )}
        <Button className="w-full" onClick={(e) => {
          e.stopPropagation();
          navigate(href);
        }}>
          <Icon className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
