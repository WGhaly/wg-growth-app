'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Shield, Target, Heart, TrendingUp, Users, BookOpen } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 animate-fadeIn">
            WG Life OS
          </h1>
          <p className="text-2xl text-text-secondary mb-4">
            Personal Life Operating System
          </p>
          <p className="text-lg text-text-tertiary mb-12 max-w-2xl mx-auto">
            A comprehensive system for disciplined Christian men pursuing excellence across all life domains.
            Build your identity, track your progress, and achieve your God-given potential.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
          <FeatureCard
            icon={<Shield className="w-8 h-8" />}
            title="Faith Foundation"
            description="Define your faith commitments, maintain a prayer list, and track your spiritual disciplines."
            category="faith"
          />
          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="Goal Management"
            description="Set and track goals across all life categories with clear milestones and progress tracking."
            category="character"
          />
          <FeatureCard
            icon={<Heart className="w-8 h-8" />}
            title="Daily Routines"
            description="Build consistent morning, evening, and weekly routines that drive excellence."
            category="health"
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Habit Tracking"
            description="Track good habits to build and bad habits to eliminate with data-driven insights."
            category="finance"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Relationship Management"
            description="Maintain meaningful connections and track interactions with important people in your life."
            category="relationships"
          />
          <FeatureCard
            icon={<BookOpen className="w-8 h-8" />}
            title="Identity Definition"
            description="Write your personal manifesto, define your values, and articulate your life vision."
            category="business"
          />
        </div>

        {/* Security Badge */}
        <div className="max-w-2xl mx-auto mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-bg-secondary border border-border-default rounded-lg">
            <Shield className="w-5 h-5 text-accent-primary" />
            <span className="text-sm text-text-secondary">
              Secured with biometric authentication (Face ID / Touch ID)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  category 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  category: string;
}) {
  return (
    <div className="p-6 bg-bg-secondary border border-border-subtle rounded-lg hover:border-accent-primary transition-all duration-200">
      <div className={`inline-flex p-3 rounded-lg bg-category-${category}/20 text-category-${category} mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-text-secondary text-sm">{description}</p>
    </div>
  );
}
