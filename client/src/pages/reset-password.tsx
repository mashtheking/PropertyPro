import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';

const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [location, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Extract token and user ID from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const userIdParam = params.get('id');
    
    if (!tokenParam || !userIdParam) {
      setError('Invalid or missing reset parameters. Please request a new password reset link.');
      return;
    }
    
    setToken(tokenParam);
    setUserId(userIdParam);
  }, []);
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token || !userId) {
      setError('Missing required parameters. Please request a new password reset link.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Send password reset request
      await apiRequest(
        'POST',
        '/api/auth/reset-password',
        { 
          token,
          userId,
          password: values.password,
          confirmPassword: values.confirmPassword
        }
      );
      
      // Show success state
      setResetComplete(true);
      toast({
        title: 'Password reset complete',
        description: 'Your password has been reset successfully.',
      });
    } catch (error) {
      console.error('Failed to reset password:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again or request a new reset link.';
      setError(`Failed to reset password. ${errorMessage}`);
      toast({
        variant: 'destructive',
        title: 'Password reset failed',
        description: 'There was a problem resetting your password.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Reset your password</CardTitle>
          <CardDescription className="text-center">
            {!resetComplete ? 
              "Enter your new password below." : 
              "Your password has been reset successfully."}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!resetComplete ? (
            token && userId ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </form>
              </Form>
            ) : (
              !error && <div className="py-4 text-center">Loading...</div>
            )
          ) : (
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="rounded-full w-12 h-12 bg-green-100 text-green-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <p className="text-center text-sm text-gray-600">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <Button
                className="mt-2"
                onClick={handleLoginClick}
              >
                Sign in
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          {!resetComplete && (
            <div className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/login">
                <a className="text-primary-600 hover:text-primary-500 font-semibold">
                  Sign in
                </a>
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}