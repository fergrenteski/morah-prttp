import React from 'react';
import { View } from 'react-native';
import { LucideIcon, Inbox } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { Text } from './Text';
import { Button } from './Button';

interface Props {
  icon?: LucideIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon = Inbox, title, message, actionLabel, onAction }: Props) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: t.spacing['3xl'], gap: t.spacing.md }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: t.brand.tint,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={28} color={t.brand.primary} strokeWidth={2} />
      </View>
      <View style={{ alignItems: 'center', gap: 4, paddingHorizontal: t.spacing.xl }}>
        <Text variant="heading" center>
          {title}
        </Text>
        {message && (
          <Text variant="body" color="muted" center>
            {message}
          </Text>
        )}
      </View>
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} variant="secondary" />
      )}
    </View>
  );
}
