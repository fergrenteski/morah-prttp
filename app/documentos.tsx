import React from 'react';
import { View, Alert } from 'react-native';
import { FileText, Download, ScrollText, Gavel, Wallet, BookOpen } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useRepositories } from '@mocks/repositories';
import { useAsync } from '@shared/hooks/useAsync';
import { Screen, BrandHeader, Card, Text, ListItem, IconButton, EmptyState } from '@core/design-system';
import { formatDate } from '@shared/utils/format';
import type { DocumentoCategoria } from '@shared/types';

const CAT: Record<DocumentoCategoria, { label: string; icon: typeof FileText }> = {
  convencao: { label: 'Convenção', icon: BookOpen },
  regulamento: { label: 'Regulamento', icon: Gavel },
  ata: { label: 'Atas', icon: ScrollText },
  balancete: { label: 'Balancetes', icon: Wallet },
};

export default function Documentos() {
  const t = useTheme();
  const repo = useRepositories();
  const { data, loading, reload } = useAsync(() => repo.documentos.list());

  const grupos = (data ?? []).reduce<Record<string, typeof data>>((acc, d) => {
    (acc[d.categoria] ||= []).push(d);
    return acc;
  }, {});

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Documentos" subtitle="Convenção, atas e balancetes" back icon={FileText} />
      <Screen edgeTop={false} refreshing={loading} onRefresh={reload}>
        {(data?.length ?? 0) === 0 && !loading && (
          <EmptyState icon={FileText} title="Sem documentos" message="Nenhum documento disponível." />
        )}
        {Object.entries(grupos).map(([cat, docs]) => {
          const meta = CAT[cat as DocumentoCategoria];
          return (
            <View key={cat} style={{ marginBottom: t.spacing.lg }}>
              <Text variant="overline" color="muted" style={{ marginBottom: t.spacing.sm }}>{meta?.label ?? cat}</Text>
              <Card>
                {(docs ?? []).map((d, i) => (
                  <View key={d.id}>
                    <ListItem
                      leadingIcon={meta?.icon ?? FileText}
                      title={d.titulo}
                      subtitle={`Atualizado em ${formatDate(d.atualizadoEm)} · ${d.tamanho}`}
                      trailing={
                        <IconButton icon={Download} tone="ghost" onPress={() => Alert.alert('Download', `“${d.titulo}” seria baixado aqui.`)} />
                      }
                    />
                    {i < (docs?.length ?? 0) - 1 && <View style={{ height: 1, backgroundColor: t.color.lineSoft }} />}
                  </View>
                ))}
              </Card>
            </View>
          );
        })}
      </Screen>
    </View>
  );
}
