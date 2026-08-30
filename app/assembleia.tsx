import React from 'react';
import { View, Pressable } from 'react-native';
import { Vote, Check, ThumbsUp, ThumbsDown, CircleMinus } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useRepositories } from '@mocks/repositories';
import { useAsync } from '@shared/hooks/useAsync';
import { Screen, BrandHeader, Card, Text, StatusPill, EmptyState } from '@core/design-system';
import { formatDateTime } from '@shared/utils/format';
import type { Enquete, VotoOpcao } from '@shared/types';

const OPCOES: { key: VotoOpcao; label: string; icon: typeof ThumbsUp; color: string }[] = [
  { key: 'sim', label: 'Sim', icon: ThumbsUp, color: '#16A34A' },
  { key: 'nao', label: 'Não', icon: ThumbsDown, color: '#DC2626' },
  { key: 'abstencao', label: 'Abster', icon: CircleMinus, color: '#94A3B8' },
];

function ResultBar({ enquete }: { enquete: Enquete }) {
  const t = useTheme();
  const total = enquete.votos.sim + enquete.votos.nao + enquete.votos.abstencao || 1;
  return (
    <View style={{ gap: t.spacing.sm, marginTop: t.spacing.md }}>
      {OPCOES.map((o) => {
        const v = enquete.votos[o.key];
        const pct = Math.round((v / total) * 100);
        const escolhido = enquete.meuVoto === o.key;
        return (
          <View key={o.key} style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="label" style={{ color: escolhido ? o.color : t.color.inkSoft }}>
                {o.label} {escolhido ? '· seu voto' : ''}
              </Text>
              <Text mono variant="label" color="muted">{pct}% · {v}</Text>
            </View>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: t.color.bgInset, overflow: 'hidden' }}>
              <View style={{ width: `${pct}%`, height: 8, borderRadius: 4, backgroundColor: o.color }} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function Assembleia() {
  const t = useTheme();
  const repo = useRepositories();
  const { data, loading, reload } = useAsync(() => repo.assembleia.list());

  async function votar(id: string, opcao: VotoOpcao) {
    await repo.assembleia.votar(id, opcao);
    reload();
  }

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Assembleia" subtitle="Enquetes e votações" back />
      <Screen edgeTop={false} refreshing={loading} onRefresh={reload}>
        {(data?.length ?? 0) === 0 && !loading && (
          <EmptyState icon={Vote} title="Sem enquetes" message="Nenhuma votação em andamento." />
        )}
        <View style={{ gap: t.spacing.md }}>
          {(data ?? []).map((e) => {
            const votou = !!e.meuVoto;
            const total = e.votos.sim + e.votos.nao + e.votos.abstencao;
            return (
              <Card key={e.id}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <StatusPill label={e.aberta ? 'Votação aberta' : 'Encerrada'} tone={e.aberta ? 'success' : 'neutral'} />
                  <Text variant="caption" color="faint">{total} votos</Text>
                </View>
                <Text variant="subheading">{e.titulo}</Text>
                <Text variant="body" color="inkSoft" style={{ marginTop: 4 }}>{e.descricao}</Text>

                {e.aberta && !votou ? (
                  <View style={{ flexDirection: 'row', gap: t.spacing.sm, marginTop: t.spacing.md }}>
                    {OPCOES.map((o) => {
                      const Icon = o.icon;
                      return (
                        <Pressable
                          key={o.key}
                          onPress={() => votar(e.id, o.key)}
                          style={({ pressed }) => ({
                            flex: 1,
                            alignItems: 'center',
                            gap: 4,
                            paddingVertical: t.spacing.md,
                            borderRadius: t.radius.md,
                            borderWidth: 1.5,
                            borderColor: t.color.line,
                            backgroundColor: pressed ? t.color.bgInset : t.color.surface,
                          })}
                        >
                          <Icon size={22} color={o.color} strokeWidth={2.2} />
                          <Text variant="label" color="inkSoft">{o.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <ResultBar enquete={e} />
                )}

                <Text variant="caption" color="faint" style={{ marginTop: t.spacing.md }}>
                  {e.aberta ? 'Encerra' : 'Encerrou'} em {formatDateTime(e.encerraEm)}
                </Text>
              </Card>
            );
          })}
        </View>
      </Screen>
    </View>
  );
}
