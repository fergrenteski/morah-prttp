import React from 'react';
import { View } from 'react-native';
import { ShoppingBag, Check, X, ShieldAlert } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useSession } from '@core/state/sessionStore';
import { useRepositories } from '@mocks/repositories';
import { useAsync } from '@shared/hooks/useAsync';
import { Screen, BrandHeader, Card, Text, StatusPill, Button, Divider, EmptyState } from '@core/design-system';
import { formatBRL, timeAgo } from '@shared/utils/format';
import type { ItemStatus, StatusTone } from '@shared/types';

const META: Record<ItemStatus, { label: string; tone: StatusTone }> = {
  ativo: { label: 'À venda', tone: 'success' },
  reservado: { label: 'Reservado', tone: 'pending' },
  vendido: { label: 'Vendido', tone: 'neutral' },
  em_moderacao: { label: 'Em moderação', tone: 'info' },
};

export default function Marketplace() {
  const t = useTheme();
  const { isSindico } = useSession();
  const repo = useRepositories();
  const { data, loading, reload } = useAsync(() => repo.marketplace.list());

  async function moderar(id: string, aprovar: boolean) {
    await repo.marketplace.moderar(id, aprovar);
    reload();
  }

  // Moradores não veem itens pendentes de moderação; síndico vê todos.
  const itens = (data ?? []).filter((i) => isSindico || i.status !== 'em_moderacao');
  const pendentes = (data ?? []).filter((i) => i.status === 'em_moderacao').length;

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="Desapegos" subtitle="Marketplace entre moradores" back icon={ShoppingBag} />
      <Screen edgeTop={false} refreshing={loading} onRefresh={reload}>
        {isSindico && pendentes > 0 && (
          <Card tone="tint" style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.md, marginBottom: t.spacing.md }}>
            <ShieldAlert size={20} color={t.brand.primaryStrong} />
            <Text variant="label" style={{ color: t.brand.primaryStrong, flex: 1 }}>
              {pendentes} anúncio(s) aguardando sua moderação
            </Text>
          </Card>
        )}
        {itens.length === 0 && !loading && (
          <EmptyState icon={ShoppingBag} title="Nada por aqui" message="Nenhum item anunciado no momento." />
        )}
        <View style={{ gap: t.spacing.md }}>
          {itens.map((i) => (
            <Card key={i.id} accent={i.status === 'em_moderacao'}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text variant="subheading">{i.titulo}</Text>
                  <Text variant="caption" color="muted" style={{ marginTop: 2 }}>{i.categoria} · {i.vendedor}</Text>
                </View>
                <StatusPill label={META[i.status].label} tone={META[i.status].tone} />
              </View>
              <Text variant="body" color="inkSoft" style={{ marginTop: 6 }}>{i.descricao}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: t.spacing.md }}>
                <Text mono variant="heading" color="brand">
                  {i.preco === 0 ? 'Doação' : formatBRL(i.preco)}
                </Text>
                <Text variant="caption" color="faint">{timeAgo(i.publicadoEm)}</Text>
              </View>

              {isSindico && i.status === 'em_moderacao' && (
                <>
                  <Divider spacing={t.spacing.md} />
                  <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
                    <Button label="Aprovar" icon={Check} variant="secondary" size="sm" onPress={() => moderar(i.id, true)} style={{ flex: 1 }} />
                    <Button label="Reprovar" icon={X} variant="danger" size="sm" onPress={() => moderar(i.id, false)} style={{ flex: 1 }} />
                  </View>
                </>
              )}
            </Card>
          ))}
        </View>
      </Screen>
    </View>
  );
}
