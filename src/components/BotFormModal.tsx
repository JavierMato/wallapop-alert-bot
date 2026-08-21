import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BotConfig } from '../types/bot';
import { ThemeColors } from '../theme/colors';
import { X, Save, Tag, DollarSign, MapPin, Clock, Bot as BotIcon } from 'lucide-react-native';

interface BotFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (botData: Omit<BotConfig, 'id' | 'createdAt' | 'foundItemsCount'> & { id?: string }) => void;
  initialBot?: BotConfig | null;
  theme: ThemeColors;
}

const INTERVAL_OPTIONS = [5, 10, 15, 30, 60];

export const BotFormModal: React.FC<BotFormModalProps> = ({
  visible,
  onClose,
  onSave,
  initialBot,
  theme,
}) => {
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [city, setCity] = useState('');
  const [distance, setDistance] = useState('');
  const [checkIntervalMinutes, setCheckIntervalMinutes] = useState(10);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (initialBot) {
      setName(initialBot.name || '');
      setKeywords(initialBot.keywords || '');
      setMinPrice(initialBot.minPrice !== undefined ? initialBot.minPrice.toString() : '');
      setMaxPrice(initialBot.maxPrice !== undefined ? initialBot.maxPrice.toString() : '');
      setCity(initialBot.city || '');
      setDistance(initialBot.distance !== undefined ? initialBot.distance.toString() : '');
      setCheckIntervalMinutes(initialBot.checkIntervalMinutes || 10);
      setEnabled(initialBot.enabled ?? true);
    } else {
      setName('');
      setKeywords('');
      setMinPrice('');
      setMaxPrice('');
      setCity('Madrid');
      setDistance('25');
      setCheckIntervalMinutes(10);
      setEnabled(true);
    }
  }, [initialBot, visible]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Campo Requerido', 'Por favor, asigna un nombre a tu Bot.');
      return;
    }
    if (!keywords.trim()) {
      Alert.alert('Campo Requerido', 'Los términos de búsqueda son obligatorios (ej: "ps5 slim").');
      return;
    }

    const parsedMinPrice = minPrice ? parseFloat(minPrice) : undefined;
    const parsedMaxPrice = maxPrice ? parseFloat(maxPrice) : undefined;

    if (parsedMinPrice !== undefined && parsedMaxPrice !== undefined && parsedMinPrice > parsedMaxPrice) {
      Alert.alert('Rango de Precio Inválido', 'El precio mínimo no puede ser superior al precio máximo.');
      return;
    }

    onSave({
      id: initialBot?.id,
      name: name.trim(),
      keywords: keywords.trim(),
      minPrice: parsedMinPrice,
      maxPrice: parsedMaxPrice,
      city: city.trim() || undefined,
      distance: distance ? parseFloat(distance) : undefined,
      checkIntervalMinutes: checkIntervalMinutes,
      enabled: enabled,
    });

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.surfaceBorder }]}>
            <View style={styles.modalHeaderTitleRow}>
              <BotIcon size={20} color={theme.primary} />
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                {initialBot ? 'Editar Bot de Alerta' : 'Nuevo Bot de Wallapop'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Enabled Switch */}
            <View style={[styles.switchRow, { backgroundColor: theme.cardBg, borderColor: theme.surfaceBorder }]}>
              <Text style={[styles.fieldLabel, { color: theme.textPrimary, marginBottom: 0 }]}>Bot Activo</Text>
              <Switch
                value={enabled}
                onValueChange={setEnabled}
                trackColor={{ false: theme.surfaceBorder, true: theme.primaryLight }}
                thumbColor={enabled ? theme.primary : theme.textMuted}
              />
            </View>

            {/* Bot Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Nombre del Bot *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.cardBg, color: theme.textPrimary, borderColor: theme.surfaceBorder }]}
                placeholder="Ej: Bici Carretera Carbono, PS5 Chollo"
                placeholderTextColor={theme.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Keywords */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelIconRow}>
                <Tag size={14} color={theme.primary} />
                <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Términos de Búsqueda *</Text>
              </View>
              <TextInput
                style={[styles.input, { backgroundColor: theme.cardBg, color: theme.textPrimary, borderColor: theme.surfaceBorder }]}
                placeholder="Ej: bicicleta carretera carbono, nintendo switch"
                placeholderTextColor={theme.textMuted}
                value={keywords}
                onChangeText={setKeywords}
              />
              <Text style={[styles.helpText, { color: theme.textMuted }]}>
                Se unirán con '+' al consultar la API de Wallapop.
              </Text>
            </View>

            {/* Price Range */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelIconRow}>
                <DollarSign size={14} color={theme.primary} />
                <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Filtro de Precio (€)</Text>
              </View>
              <View style={styles.rowTwoInputs}>
                <TextInput
                  style={[styles.input, styles.halfInput, { backgroundColor: theme.cardBg, color: theme.textPrimary, borderColor: theme.surfaceBorder }]}
                  placeholder="Mín (€)"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                />
                <TextInput
                  style={[styles.input, styles.halfInput, { backgroundColor: theme.cardBg, color: theme.textPrimary, borderColor: theme.surfaceBorder }]}
                  placeholder="Máx (€)"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                />
              </View>
            </View>

            {/* Location & Distance */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelIconRow}>
                <MapPin size={14} color={theme.primary} />
                <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Ubicación y Radio (km)</Text>
              </View>
              <View style={styles.rowTwoInputs}>
                <TextInput
                  style={[styles.input, styles.halfInput, { backgroundColor: theme.cardBg, color: theme.textPrimary, borderColor: theme.surfaceBorder }]}
                  placeholder="Ciudad (ej: Madrid)"
                  placeholderTextColor={theme.textMuted}
                  value={city}
                  onChangeText={setCity}
                />
                <TextInput
                  style={[styles.input, styles.halfInput, { backgroundColor: theme.cardBg, color: theme.textPrimary, borderColor: theme.surfaceBorder }]}
                  placeholder="Radio (km)"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={distance}
                  onChangeText={setDistance}
                />
              </View>
            </View>

            {/* Check Interval Selector */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelIconRow}>
                <Clock size={14} color={theme.primary} />
                <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>Intervalo de Refresco</Text>
              </View>
              <View style={styles.intervalRow}>
                {INTERVAL_OPTIONS.map((interval) => {
                  const isSelected = checkIntervalMinutes === interval;
                  return (
                    <TouchableOpacity
                      key={interval}
                      style={[
                        styles.intervalChip,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.cardBg,
                          borderColor: isSelected ? theme.primary : theme.surfaceBorder,
                        },
                      ]}
                      onPress={() => setCheckIntervalMinutes(interval)}
                    >
                      <Text
                        style={[
                          styles.intervalChipText,
                          { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                        ]}
                      >
                        {interval} min
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Save Button */}
          <View style={[styles.modalFooter, { borderTopColor: theme.surfaceBorder }]}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.surfaceBorder }]} onPress={onClose}>
              <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSave}>
              <Save size={16} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Guardar Bot</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  formScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  labelIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  helpText: {
    fontSize: 11,
    marginTop: 4,
  },
  rowTwoInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  intervalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  intervalChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  intervalChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
