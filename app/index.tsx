import React from 'react';
import { Redirect } from 'expo-router';
import { useSession } from '@core/state/sessionStore';

/** Porta de entrada: sem sessão → login; porteiro → portaria; demais → início. */
export default function Index() {
  const { user, isPorteiro } = useSession();
  if (!user) return <Redirect href="/login" />;
  if (isPorteiro) return <Redirect href="/portaria" />;
  return <Redirect href="/inicio" />;
}
