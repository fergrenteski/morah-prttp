import React, { useState } from 'react';
import { View } from 'react-native';
import { Sparkles, Check, Bell } from 'lucide-react-native';
import { useTheme } from '@core/theme/ThemeProvider';
import { useTenant } from '@core/state/tenantStore';
import {
  Screen,
  BrandHeader,
  Card,
  Text,
  Button,
  Chip,
  StatusPill,
  Input,
  Avatar,
  SegmentedControl,
  Stat,
  ListItem,
  SectionHeader,
  Divider,
} from '@core/design-system';
import type { StatusTone } from '@core/theme/tokens';

const STATUS_TONES: StatusTone[] = ['success', 'approved', 'pending', 'neutral', 'danger', 'info'];

function Swatch({ color, name }: { color: string; name: string }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 4, width: 64 }}>
      <View style={{ width: 52, height: 52, borderRadius: t.radius.md, backgroundColor: color, borderWidth: 1, borderColor: t.color.line }} />
      <Text variant="caption" color="muted" numberOfLines={1}>{name}</Text>
    </View>
  );
}

export default function UiKit() {
  const t = useTheme();
  const { tenant } = useTenant();
  const [seg, setSeg] = useState<'a' | 'b'>('a');

  return (
    <View style={{ flex: 1 }}>
      <BrandHeader title="UI Kit" subtitle={`Design System · ${tenant.name}`} back icon={Sparkles} />
      <Screen edgeTop={false}>
        <Text variant="body" color="muted">
          Documentação viva do design system. Todos os componentes leem o tema do tenant ativo —
          troque de condomínio e veja tudo re-temizar.
        </Text>

        <SectionHeader title="Marca" overline="Tokens" style={{ marginTop: t.spacing.lg }} />
        <Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.md }}>
            <Swatch color={t.brand.primary} name="primary" />
            <Swatch color={t.brand.primaryStrong} name="strong" />
            <Swatch color={t.brand.secondary} name="secondary" />
            <Swatch color={t.brand.tint} name="tint" />
          </View>
        </Card>

        <SectionHeader title="Tipografia" overline="Public Sans · IBM Plex Mono" />
        <Card>
          <Text variant="display">Display</Text>
          <Text variant="title">Title</Text>
          <Text variant="heading">Heading</Text>
          <Text variant="subheading">Subheading</Text>
          <Text variant="body">Body — corpo de texto padrão.</Text>
          <Text variant="label" color="muted">Label</Text>
          <Text variant="caption" color="faint">Caption</Text>
          <Text mono style={{ marginTop: 6, color: t.color.ink }}>R$ 1.284,90 · 30/08/2026 · un-0803</Text>
        </Card>

        <SectionHeader title="Botões" overline="Button" />
        <Card>
          <View style={{ gap: t.spacing.sm }}>
            <Button label="Primary" icon={Check} onPress={() => {}} />
            <Button label="Secondary" variant="secondary" onPress={() => {}} />
            <Button label="Outline" variant="outline" onPress={() => {}} />
            <Button label="Ghost" variant="ghost" onPress={() => {}} />
            <Button label="Danger" variant="danger" onPress={() => {}} />
          </View>
        </Card>

        <SectionHeader title="Status pills" overline="StatusPill · cores semânticas" />
        <Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm }}>
            {STATUS_TONES.map((tone) => (
              <StatusPill key={tone} label={tone} tone={tone} />
            ))}
          </View>
        </Card>

        <SectionHeader title="Chips e segmentos" overline="Chip · SegmentedControl" />
        <Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.spacing.sm, marginBottom: t.spacing.md }}>
            <Chip label="Selecionado" selected onPress={() => {}} />
            <Chip label="Opção" onPress={() => {}} />
            <Chip label="Outra" onPress={() => {}} />
          </View>
          <SegmentedControl
            segments={[{ value: 'a', label: 'Visitantes' }, { value: 'b', label: 'Encomendas' }]}
            value={seg}
            onChange={setSeg}
          />
        </Card>

        <SectionHeader title="Indicadores" overline="Stat" />
        <View style={{ flexDirection: 'row', gap: t.spacing.md }}>
          <Stat value="R$ 1.284" label="em aberto" tone="pending" />
          <Stat value="3" label="chamados" tone="danger" />
          <Stat value="12" label="reservas" tone="success" />
        </View>

        <SectionHeader title="Campos e listas" overline="Input · Avatar · ListItem" />
        <Card>
          <Input label="Campo de texto" placeholder="Digite algo…" />
          <Divider spacing={t.spacing.md} />
          <ListItem
            leading={<Avatar initials="RN" size={40} />}
            title="Rafael Nunes"
            subtitle="Bloco A · 803"
            trailing={<StatusPill label="Proprietário" tone="approved" dot={false} />}
          />
          <ListItem leadingIcon={Bell} title="Item com ícone" subtitle="Subtítulo do item" chevron />
        </Card>

        <View style={{ height: t.spacing.xl }} />
      </Screen>
    </View>
  );
}
