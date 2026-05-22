'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SplashScreen } from '@/components/ui/SplashScreen';

export default function RootPage() {
  const router = useRouter();

  const finish = () => {
    const user = localStorage.getItem('noor_user');
    const onboarded = localStorage.getItem('noor_onboarded');
    if (user) router.replace('/home');
    else if (onboarded) router.replace('/auth/register');
    else router.replace('/onboarding');
  };

  return <SplashScreen onDone={finish} />;
}
