import React from 'react';
import {
  Modal,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { Text } from './Text';

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Folha inferior para formulários e ações (modal com backdrop). */
export function BottomSheet({ visible, onClose, title, subtitle, children, footer }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.45)' }}
          onPress={onClose}
        />
        <View
          style={{
            backgroundColor: t.color.surface,
            borderTopLeftRadius: t.radius['2xl'],
            borderTopRightRadius: t.radius['2xl'],
            paddingHorizontal: t.spacing.lg,
            paddingTop: t.spacing.md,
            paddingBottom: insets.bottom + t.spacing.lg,
            maxHeight: '88%',
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: t.color.line,
              marginBottom: t.spacing.md,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: t.spacing.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text variant="title">{title}</Text>
              {subtitle && (
                <Text variant="label" color="muted" style={{ marginTop: 2 }}>
                  {subtitle}
                </Text>
              )}
            </View>
            <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Fechar">
              <X size={24} color={t.color.muted} />
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: t.spacing.md, paddingBottom: t.spacing.sm }}
          >
            {children}
          </ScrollView>
          {footer && <View style={{ marginTop: t.spacing.md }}>{footer}</View>}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
