import React from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ActivityList, type Activity } from '@/components/dashboard/activity-list';
import { UpcomingAppointments, type AppointmentPreview } from '@/components/dashboard/upcoming-appointments';
import { AdRewardSection } from '@/components/dashboard/ad-reward-section';
import { EmailVerificationBanner } from '@/components/ui/email-verification-banner';
import { useSubscription } from '@/contexts/subscription-context';
import { useAuth } from '@/contexts/auth-context';

const Dashboard = () => {
  const [, navigate] = useLocation();
  const { isPremium } = useSubscription();
  const { user } = useAuth();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Fetch recent activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['/api/dashboard/activities'],
  });

  // Fetch upcoming appointments
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<AppointmentPreview[]>({
    queryKey: ['/api/dashboard/appointments'],
  });

  return (
    <div className="space-y-6">
      {/* Email Verification Banner */}
      {user && !user.emailVerified && (
        <EmailVerificationBanner className="mb-4" />
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        {!isPremium && (
          <Button 
            onClick={() => navigate('/subscription')}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <span className="material-icons mr-2 text-yellow-300">star</span>
            Upgrade to Premium
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          icon="home"
          iconColor="text-primary-600"
          iconBgColor="bg-primary-100"
          title="Total Properties"
          value={statsLoading ? "Loading..." : stats?.properties.count || "0"}
          change={statsLoading ? undefined : stats?.properties.change}
          linkHref="/properties"
          linkText="View all properties"
          linkColor="text-primary-600 hover:text-primary-500"
        />

        <StatsCard
          icon="people"
          iconColor="text-secondary-600"
          iconBgColor="bg-secondary-100"
          title="Active Clients"
          value={statsLoading ? "Loading..." : stats?.clients.count || "0"}
          change={statsLoading ? undefined : stats?.clients.change}
          linkHref="/clients"
          linkText="View all clients"
          linkColor="text-secondary-600 hover:text-secondary-500"
        />

        <StatsCard
          icon="event"
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
          title="Upcoming Appointments"
          value={statsLoading ? "Loading..." : stats?.appointments.count || "0"}
          change={statsLoading ? undefined : stats?.appointments.change}
          linkHref="/appointments"
          linkText="View all appointments"
          linkColor="text-yellow-600 hover:text-yellow-500"
        />
      </div>

      {/* Recent Activities & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityList 
          activities={activities} 
          isLoading={activitiesLoading} 
        />

        <UpcomingAppointments 
          appointments={appointments}
          isLoading={appointmentsLoading} 
        />
      </div>
      
      {/* Ad Section for Free Users */}
      {!isPremium && (
        <AdRewardSection />
      )}
    </div>
  );
};

export default Dashboard;
