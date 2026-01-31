'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BookOpen, Heart, Target, TrendingUp, Users, Briefcase } from 'lucide-react';

const steps = [
  { id: 1, title: 'Welcome', icon: BookOpen },
  { id: 2, title: 'Year Theme', icon: Heart },
  { id: 3, title: 'Values', icon: Target },
  { id: 4, title: 'Faith', icon: Heart },
  { id: 5, title: 'Goals', icon: TrendingUp },
  { id: 6, title: 'Complete', icon: Users }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    yearTheme: '',
    seasonDescription: '',
    values: ['', '', ''],
    faithCommitment: '',
    goals: { faith: '', character: '', health: '', finance: '', business: '', relationships: '' }
  });

  const progress = (currentStep / steps.length) * 100;

  function handleNext() {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  async function handleComplete() {
    // TODO: Save onboarding data
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-secondary">
              Step {currentStep} of {steps.length}
            </p>
            <p className="text-sm font-semibold text-accent-primary">
              {Math.round(progress)}% Complete
            </p>
          </div>
          <ProgressBar value={progress} />
        </div>

        <Card variant="elevated">
          {currentStep === 1 && <WelcomeStep />}
          {currentStep === 2 && (
            <YearThemeStep 
              formData={formData} 
              setFormData={setFormData} 
            />
          )}
          {currentStep === 3 && (
            <ValuesStep 
              formData={formData} 
              setFormData={setFormData} 
            />
          )}
          {currentStep === 4 && (
            <FaithStep 
              formData={formData} 
              setFormData={setFormData} 
            />
          )}
          {currentStep === 5 && (
            <GoalsStep 
              formData={formData} 
              setFormData={setFormData} 
            />
          )}
          {currentStep === 6 && <CompleteStep />}

          <CardFooter>
            <div className="flex gap-3 w-full">
              {currentStep > 1 && (
                <Button variant="secondary" onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button 
                onClick={handleNext}
                fullWidth={currentStep === 1}
                className={currentStep > 1 ? 'flex-1' : ''}
              >
                {currentStep === steps.length ? 'Get Started' : 'Continue'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <>
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-accent-primary/10 rounded-full">
            <BookOpen size={48} className="text-accent-primary" />
          </div>
        </div>
        <CardTitle className="text-center">Welcome to WG Life OS</CardTitle>
        <CardDescription className="text-center">
          Let's set up your personal operating system in a few quick steps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-text-secondary text-center">
            This onboarding will help you define your identity, set your vision, 
            and establish the foundation for disciplined excellence across all life domains.
          </p>
          <Alert variant="info">
            You can always update these settings later from your profile.
          </Alert>
        </div>
      </CardContent>
    </>
  );
}

function YearThemeStep({ formData, setFormData }: any) {
  return (
    <>
      <CardHeader>
        <CardTitle>Define Your Year Theme</CardTitle>
        <CardDescription>
          What is the overarching theme or focus for this season of your life?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          label="Year Theme"
          placeholder="e.g., Year of Discipline, Year of Growth"
          value={formData.yearTheme}
          onChange={(e) => setFormData({ ...formData, yearTheme: e.target.value })}
        />
        <Textarea
          label="Season Description"
          placeholder="Describe this season of your life and what you want to accomplish..."
          value={formData.seasonDescription}
          onChange={(e) => setFormData({ ...formData, seasonDescription: e.target.value })}
        />
      </CardContent>
    </>
  );
}

function ValuesStep({ formData, setFormData }: any) {
  return (
    <>
      <CardHeader>
        <CardTitle>Define Your Core Values</CardTitle>
        <CardDescription>
          What are the 3 most important values that guide your life?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[0, 1, 2].map((index) => (
          <Input
            key={index}
            label={`Value ${index + 1}`}
            placeholder="e.g., Integrity, Excellence, Faith"
            value={formData.values[index]}
            onChange={(e) => {
              const newValues = [...formData.values];
              newValues[index] = e.target.value;
              setFormData({ ...formData, values: newValues });
            }}
          />
        ))}
      </CardContent>
    </>
  );
}

function FaithStep({ formData, setFormData }: any) {
  return (
    <>
      <CardHeader>
        <CardTitle>Faith Commitment</CardTitle>
        <CardDescription>
          Define your faith commitment and spiritual disciplines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          label="My Faith Commitment"
          placeholder="Describe your relationship with God and your spiritual commitments..."
          value={formData.faithCommitment}
          onChange={(e) => setFormData({ ...formData, faithCommitment: e.target.value })}
          rows={6}
        />
      </CardContent>
    </>
  );
}

function GoalsStep({ formData, setFormData }: any) {
  const categories = [
    { key: 'faith', label: 'Faith', icon: Heart },
    { key: 'character', label: 'Character', icon: Target },
    { key: 'health', label: 'Health', icon: TrendingUp },
    { key: 'finance', label: 'Finance', icon: Target },
    { key: 'business', label: 'Business', icon: Briefcase },
    { key: 'relationships', label: 'Relationships', icon: Users }
  ];

  return (
    <>
      <CardHeader>
        <CardTitle>Set Initial Goals</CardTitle>
        <CardDescription>
          Set one major goal for each life category (you can add more later)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {categories.map((category) => (
          <Input
            key={category.key}
            label={category.label}
            placeholder={`Your ${category.label.toLowerCase()} goal...`}
            value={formData.goals[category.key]}
            onChange={(e) => setFormData({ 
              ...formData, 
              goals: { ...formData.goals, [category.key]: e.target.value }
            })}
          />
        ))}
      </CardContent>
    </>
  );
}

function CompleteStep() {
  return (
    <>
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-semantic-success/10 rounded-full">
            <Heart size={48} className="text-semantic-success" />
          </div>
        </div>
        <CardTitle className="text-center">You're All Set!</CardTitle>
        <CardDescription className="text-center">
          Your personal operating system is ready
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="success">
          You've completed the initial setup. Now it's time to start building excellence across all life domains.
        </Alert>
      </CardContent>
    </>
  );
}
