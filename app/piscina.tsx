import React from 'react';
import { View, Switch } from 'react-native';
import { WavesLadder, Sparkles, FileCheck } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useSession } from '@core/state/sessionStore';
import { useRepositories } from '@mocks/repositories';
import { useAsync } from '@shared/hooks/useAsync';
import { Screen, BrandHeader, Card, Text, StatusPill, Avatar, Divider, EmptyState } from '@core/design-system';
import { formatDate, initialsOf } from '@shared/utils/format';
import type { AtestadoStatus, StatusTone } from '@shared/types';

const ATESTADO: Record<AtestadoStatus, { label: string; tone: StatusTone }> = {
  valido: { label: 'Atestado válido', tone: 'success' },
  vencido: { label: 'Atestado vencido', tone: 'danger' },
  ausente: { label: 'Sem atestado', tone: 'pending' },
};

export default function Piscina() {
  const t = useTheme();
  const { isSindico } = useSession();
  const repo = useRepositories();
  const { data, loading, reload } = useAsync(() => repo.piscina.list());

  async function toggle(moradorId: string, valor: boolean) {
    await repo.piscina.setLiberado(moradorId, valor);
    reload();
  }

  const liberados = (data ?? []).filter((a) => a.liberado).length;

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Piscina" subtitle="Acesso com atestado médico" back icon={WavesLadder} />
      <Screen edgeTop={false} refreshing={loading} onRefresh={reload}>
        <Card tone="tint" style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, marginBottom: t.spacing.md }}>
          <Sparkles size={20} color={t.brand.primaryStrong} />
          <Text variant="caption" style={{ color: t.brand.primaryStrong, flex: 1 }}>
            Função exclusiva deste condomínio residencial. O acesso à piscina exige atestado médico
            válido anexado no cadastro do morador.
          </Text>
        </Card>

        <Card style={{ marginBottom: t.spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
            <FileCheck size={22} color={t.brand.primary} />
            <View style={{ flex: 1 }}>
              <Text variant="subheading">{liberados} de {data?.length ?? 0} liberados</Text>
              <Text variant="caption" color="muted">Controle de acesso da unidade</Text>
            </View>
          </View>
        </Card>

        {(data?.length ?? 0) === 0 && !loading && (
          <EmptyState icon={WavesLadder} title="Sem registros" message="Nenhum morador cadastrado." />
        )}
        <View style={{ gap: t.spacing.md }}>
          {(data ?? []).map((a) => {
            const meta = ATESTADO[a.atestadoStatus];
            return (
              <Card key={a.moradorId}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md }}>
                  <Avatar initials={initialsOf(a.moradorNome)} size={44} tone="neutral" />
                  <View style={{ flex: 1 }}>
                    <Text variant="subheading">{a.moradorNome}</Text>
                    <Text variant="caption" color="muted">{a.unidadeLabel}</Text>
                  </View>
                  <StatusPill label={a.liberado ? 'Liberado' : 'Bloqueado'} tone={a.liberado ? 'success' : 'neutral'} />
                </View>
                <Divider spacing={t.spacing.md} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <StatusPill label={meta.label} tone={meta.tone} dot={false} />
                    {a.atestadoValidade && (
                      <Text variant="caption" color="faint" style={{ marginTop: 4 }}>
                        Validade {formatDate(a.atestadoValidade)}
                      </Text>
                    )}
                  </View>
                  {isSindico && (
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text variant="caption" color="muted">Liberar acesso</Text>
                      <Switch
                        value={a.liberado}
                        disabled={a.atestadoStatus !== 'valido'}
                        onValueChange={(v) => toggle(a.moradorId, v)}
                        trackColor={{ true: t.brand.primary, false: t.color.line }}
                        thumbColor="#FFFFFF"
                      />
                    </View>
                  )}
                </View>
              </Card>
            );
          })}
        </View>
      </Screen>
    </View>
  );
}
