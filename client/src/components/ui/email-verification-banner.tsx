import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest } from '@/lib/queryClient';

interface EmailVerificationBannerProps {
  className?: string;
}

export function EmailVerificationBanner({ className }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  if (!user || user.emailVerified || isDismissed) {
    return null;
  }

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      // Make API call to resend verification email
      await apiRequest('/api/auth/resend-verification', {
        method: 'POST',
      }, {
        email: user.email
      });
      
      toast({
        title: 'Verification email sent',
        description: 'Please check your inbox and click the verification link.',
        variant: 'default'
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      toast({
        title: 'Failed to send verification email',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Alert className={`border-yellow-500 bg-yellow-50 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200 ${className || ''}`}>
      <AlertCircle className="h-4 w-4 mr-2" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full">
        <div>
          <AlertTitle>Verify your email address</AlertTitle>
          <AlertDescription>
            Please verify your email address to unlock all features.
          </AlertDescription>
        </div>
        <div className="flex mt-3 sm:mt-0 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResendVerification} 
            disabled={isResending}
          >
            {isResending ? 'Sending...' : 'Resend verification'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsDismissed(true)}
          >
            Dismiss
          </Button>
        </div>
      </div>
    </Alert>
  );
}