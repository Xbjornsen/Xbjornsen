import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMagnetometer } from '../context/MagnetometerContext';
import { useSession } from '../context/SessionContext';
import { ALERT_COLORS, COLORS, getAlertLevel } from '../constants/colors';
import SessionCard from '../components/SessionCard';
import { Session } from '../types';

export default function SessionsScreen() {
  const { reading } = useMagnetometer();
  const { sessions, activeSession, loading, startSession, stopSession, deleteSession, updateNotes } =
    useSession();

  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [stopModalVisible, setStopModalVisible] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [stopNotes, setStopNotes] = useState('');

  const handleStartPress = () => {
    setSessionName(`Session ${new Date().toLocaleTimeString()}`);
    setNameModalVisible(true);
  };

  const confirmStart = () => {
    startSession(sessionName);
    setNameModalVisible(false);
  };

  const handleStopPress = () => {
    setStopNotes('');
    setStopModalVisible(true);
  };

  const confirmStop = async () => {
    await stopSession(stopNotes);
    setStopModalVisible(false);
  };

  const currentColor = activeSession
    ? ALERT_COLORS[getAlertLevel(reading.magnitude)]
    : COLORS.textSecondary;

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Active session widget */}
      {activeSession ? (
        <View style={[styles.activeBanner, { borderColor: currentColor }]}>
          <View style={styles.activeBannerLeft}>
            <View style={[styles.recordDot, { backgroundColor: COLORS.veryHigh }]} />
            <View>
              <Text style={styles.activeLabel}>RECORDING</Text>
              <Text style={styles.activeName} numberOfLines={1}>
                {activeSession.name}
              </Text>
            </View>
          </View>
          <View style={styles.activeBannerRight}>
            <Text style={[styles.activeMagnitude, { color: currentColor }]}>
              {reading.magnitude.toFixed(1)} µT
            </Text>
            <Text style={styles.activePeak}>
              peak {activeSession.peakReading.toFixed(1)} µT
            </Text>
            <TouchableOpacity style={styles.stopBtn} onPress={handleStopPress}>
              <Text style={styles.stopBtnText}>■ STOP</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.startBtn} onPress={handleStartPress}>
          <Text style={styles.startBtnIcon}>▶</Text>
          <Text style={styles.startBtnText}>START SESSION</Text>
        </TouchableOpacity>
      )}

      {/* Session list */}
      {sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Sessions Yet</Text>
          <Text style={styles.emptyText}>
            Tap "Start Session" to begin recording a measurement session.
          </Text>
        </View>
      ) : (
        <FlatList<Session>
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SessionCard
              session={item}
              onDelete={deleteSession}
              onUpdateNotes={updateNotes}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Start session modal */}
      <Modal
        visible={nameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Name This Session</Text>
            <TextInput
              style={styles.modalInput}
              value={sessionName}
              onChangeText={setSessionName}
              placeholder="Session name..."
              placeholderTextColor={COLORS.textMuted}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalBtnSecondary}
                onPress={() => setNameModalVisible(false)}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnPrimary} onPress={confirmStart}>
                <Text style={styles.modalBtnPrimaryText}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Stop session modal */}
      <Modal
        visible={stopModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStopModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Stop Session</Text>
            <Text style={styles.modalSubtitle}>Add notes (optional)</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={stopNotes}
              onChangeText={setStopNotes}
              placeholder="Location, observations, etc..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalBtnSecondary}
                onPress={() => setStopModalVisible(false)}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnPrimary, { backgroundColor: COLORS.veryHigh }]}
                onPress={confirmStop}
              >
                <Text style={styles.modalBtnPrimaryText}>Stop & Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  activeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  activeBannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  recordDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: COLORS.veryHigh,
    letterSpacing: 2,
  },
  activeName: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '700',
    maxWidth: 140,
  },
  activeBannerRight: { alignItems: 'flex-end', gap: 4 },
  activeMagnitude: { fontFamily: 'monospace', fontSize: 22, fontWeight: '900' },
  activePeak: { fontFamily: 'monospace', fontSize: 10, color: COLORS.textSecondary },
  stopBtn: {
    backgroundColor: COLORS.veryHigh,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  stopBtnText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 1,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    gap: 10,
  },
  startBtnIcon: { fontSize: 16, color: COLORS.accent },
  startBtnText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '700',
    letterSpacing: 2,
  },
  list: { paddingTop: 4, paddingBottom: 32 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: {
    fontFamily: 'monospace',
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: {
    fontFamily: 'monospace',
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 1,
  },
  modalSubtitle: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 8,
    letterSpacing: 1,
  },
  modalInput: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 12,
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  modalTextArea: { minHeight: 72, textAlignVertical: 'top' },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalBtnSecondary: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalBtnSecondaryText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  modalBtnPrimary: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
  },
  modalBtnPrimaryText: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: COLORS.background,
    fontWeight: '700',
  },
});
