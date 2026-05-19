import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ALERT_COLORS, COLORS, getAlertLevel } from '../constants/colors';
import { Session } from '../types';

interface Props {
  session: Session;
  onDelete: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

function formatDuration(ms: number): string {
  const secs = Math.floor(ms / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SessionCard({ session, onDelete, onUpdateNotes }: Props) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(session.notes);
  const level = getAlertLevel(session.peakReading);
  const peakColor = ALERT_COLORS[level];
  const duration = session.endTime - session.startTime;

  const confirmDelete = () => {
    Alert.alert('Delete Session', `Delete "${session.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(session.id),
      },
    ]);
  };

  const saveNotes = () => {
    setEditingNotes(false);
    onUpdateNotes(session.id, notes);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.levelDot, { backgroundColor: peakColor }]} />
          <Text style={styles.name} numberOfLines={1}>
            {session.name}
          </Text>
        </View>
        <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.date}>{formatDate(session.startTime)}</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>PEAK</Text>
          <Text style={[styles.statValue, { color: peakColor }]}>
            {session.peakReading.toFixed(1)} µT
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>AVG</Text>
          <Text style={styles.statValue}>{session.averageReading.toFixed(1)} µT</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>DURATION</Text>
          <Text style={styles.statValue}>{formatDuration(duration)}</Text>
        </View>
      </View>

      {editingNotes ? (
        <View style={styles.notesEdit}>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            autoFocus
          />
          <TouchableOpacity onPress={saveNotes} style={styles.saveBtn}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => setEditingNotes(true)}>
          <Text style={styles.notes}>
            {notes || <Text style={styles.notesPlaceholder}>Tap to add notes…</Text>}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  name: {
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  date: {
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    fontSize: 11,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 3,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
  },
  notes: {
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  notesPlaceholder: {
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  notesEdit: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  notesInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: 'monospace',
    fontSize: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent,
    paddingVertical: 4,
    minHeight: 32,
  },
  saveBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveBtnText: {
    color: COLORS.background,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
});
