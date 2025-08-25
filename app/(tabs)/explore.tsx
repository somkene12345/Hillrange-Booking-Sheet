import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { ref, onValue, remove } from 'firebase/database';
import { database } from '../../firebaseConfig';
import { useTheme } from '../../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DELETE_PASSWORD } from '@env';

const ExplorePage: React.FC = () => {
  const { darkMode } = useTheme();
  const [bookingData, setBookingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyStats, setWeeklyStats] = useState<{ [cls: string]: { current: number, prev: number } }>({});
  const [detentions, setDetentions] = useState<string[]>([]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'booking' | 'teacher', id: string } | null>(null);
  const [passwordInput, setPasswordInput] = useState("");

  const styles = getStyles(darkMode);

  useEffect(() => {
    const bookingsRef = ref(database, 'bookings');
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setBookingData([]);
        setWeeklyStats({});
        setLoading(false);
        return;
      }

      const teachers = data.teachers || {};
      const bookings = data.data || {};

      const now = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      const prevWeekAgo = new Date();
      prevWeekAgo.setDate(now.getDate() - 14);

      let currentWeek: { [cls: string]: number } = {};
      let prevWeek: { [cls: string]: number } = {};
      let studentCount: { [name: string]: number } = {};

      const thisWeeksBookings = Object.entries(bookings)
        .map(([id, row]: [string, any]) => ({
          ...row,
          id,
          teacherName: Object.values(teachers).find((t: any) => t.teacherName?.toLowerCase() === row.teacherName?.toLowerCase())?.teacherName || "Unknown",
          date: row.date,
          time: row.time || new Date(row.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
        .filter(row => new Date(row.date) >= weekAgo)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setBookingData(thisWeeksBookings);

      Object.values(bookings).forEach((row: any) => {
        if (!row.name || !row.class || !row.date) return;
        const bookingDate = new Date(row.date);
        const className = row.class;

        if (bookingDate >= weekAgo) {
          currentWeek[className] = (currentWeek[className] || 0) + 1;
          studentCount[row.name] = (studentCount[row.name] || 0) + 1;
        } else if (bookingDate >= prevWeekAgo && bookingDate < weekAgo) {
          prevWeek[className] = (prevWeek[className] || 0) + 1;
        }
      });

      setWeeklyStats(
        Object.fromEntries(
          Object.keys({ ...currentWeek, ...prevWeek }).map(cls => [
            cls,
            { current: currentWeek[cls] || 0, prev: prevWeek[cls] || 0 }
          ])
        )
      );

      setDetentions(Object.keys(studentCount).filter(name => studentCount[name] >= 3));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const requestDelete = (type: 'booking' | 'teacher', id: string) => {
    setDeleteTarget({ type, id });
    setPasswordInput("");
    setModalVisible(true);
  };

  const confirmDelete = () => {
    if (passwordInput !== DELETE_PASSWORD) {
      Alert.alert("Error", "Incorrect password.");
      return;
    }
    if (deleteTarget) {
      const path = deleteTarget.type === 'booking'
        ? `bookings/data/${deleteTarget.id}`
        : `bookings/teachers/${deleteTarget.id}`;
      remove(ref(database, path))
        .then(() => Alert.alert("Deleted", `${deleteTarget.type} removed.`))
        .catch(err => Alert.alert("Error", err.message));
    }
    setModalVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fa0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Weekly Stats */}
      <View style={styles.analysisBar}>
        {Object.entries(weeklyStats).map(([cls, stats], i) => (
          <Text key={i} style={styles.analysisText}>
            {cls}: {stats.current} this week ({stats.current - stats.prev >= 0 ? '+' : ''}{stats.current - stats.prev} vs last week)
          </Text>
        ))}
      </View>

      {detentions.length > 0 && (
        <Text style={styles.detentionText}>
          Detention: {detentions.join(', ')}
        </Text>
      )}

      {/* Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>Student</Text>
          <Text style={[styles.headerCell, { flex: 2 }]}>Teacher</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Class</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Team</Text>
          <Text style={[styles.headerCell, { flex: 2 }]}>Date</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Time</Text>
          <Text style={[styles.headerCell, { flex: 3 }]}>Remark</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>❌</Text>
        </View>

        <ScrollView style={{ maxHeight: 300 }}>
          {bookingData.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={[styles.cell, { flex: 2 }]}>{item.name}</Text>
              <Text style={[styles.cell, { flex: 2 }]}>{item.teacherName}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{item.class}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{item.team}</Text>
              <Text style={[styles.cell, { flex: 2 }]}>{item.date}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{item.time}</Text>
              <Text style={[styles.cell, { flex: 3 }]}>{item.remark}</Text>
              <TouchableOpacity onPress={() => requestDelete('booking', item.id)} style={{ flex: 1, alignItems: 'center' }}>
                <Ionicons name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Teacher List */}
<View style={styles.table}>
  <View style={styles.tableHeader}>
    <Text style={[styles.headerCell, { flex: 3 }]}>Teacher</Text>
    <Text style={[styles.headerCell, { flex: 2 }]}>Subject</Text>
    <Text style={[styles.headerCell, { flex: 1 }]}>Action</Text>
  </View>

  <ScrollView style={{ maxHeight: 200 }}>
    {Object.values(teachers).map((t: any, i: number) => (
      <View style={styles.tableRow} key={i}>
        <Text style={[styles.cell, { flex: 3 }]}>{t.teacherName}</Text>
        <TouchableOpacity
          style={[styles.cell, { flex: 1 }]}
          onPress={() => {
            setDeleteTarget({ type: 'teacher', id: t.id });
            setPasswordModalVisible(true);
          }}
        >
          <Text style={{ color: 'red', fontWeight: 'bold' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    ))}
  </ScrollView>
</View>

<Modal
  transparent
  visible={passwordModalVisible}
  animationType="fade"
  onRequestClose={() => setPasswordModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Enter Delete Password</Text>
      <TextInput
        style={styles.modalInput}
        secureTextEntry
        placeholder="Password"
        placeholderTextColor={darkMode ? '#888' : '#999'}
        value={enteredPassword}
        onChangeText={setEnteredPassword}
      />
      <View style={styles.modalButtons}>
        <TouchableOpacity
          style={styles.modalButton}
          onPress={() => setPasswordModalVisible(false)}
        >
          <Text style={styles.modalButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modalButton}
          onPress={handleConfirmDelete}
        >
          <Text style={[styles.modalButtonText, { color: 'red' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </View>
  );
};



const getStyles = (darkMode: boolean) =>
  StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: dark ? '#121212' : '#fff',
      flex: 1,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    analysisBar: {
      padding: 10,
      backgroundColor: dark ? '#1e1e1e' : '#f5f5f5',
      marginBottom: 10,
      borderRadius: 5,
    },
    analysisText: {
      color: dark ? '#fff' : '#000',
      fontSize: 14,
    },
    detentionText: {
      color: 'red',
      marginBottom: 10,
      fontWeight: 'bold',
    },
    table: {
    padding: 10,
    backgroundColor: dark ? '#1e1e1e' : '#f5f5f5',
  marginBottom: 10,
  borderRadius: 5,
},
tableHeader: {
  flexDirection: 'row',
  backgroundColor: dark ? '#1f1f1f' : '#e6e6e6',
  borderColor: dark ? '#333' : '#ccc',
  borderBottomWidth: 1,
},
headerCell: {
  padding: 8,
  fontWeight: 'bold',
  color: dark ? '#fff' : '#000',
},
tableRow: {
  flexDirection: 'row',
  borderBottomWidth: 1,
  borderColor: dark ? '#333' : '#ccc',
},
cell: {
  padding: 8,
  color: dark ? '#ccc' : '#333',
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContainer: {
  backgroundColor: darkMode ? '#222' : '#fff',
  padding: 20,
  borderRadius: 12,
  width: '80%',
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
  color: darkMode ? '#fff' : '#000',
},
modalInput: {
  borderWidth: 1,
  borderColor: darkMode ? '#555' : '#ccc',
  padding: 10,
  borderRadius: 8,
  marginBottom: 12,
  color: darkMode ? '#fff' : '#000',
},
modalButtons: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
},
modalButton: {
  padding: 8,
  marginLeft: 8,
},
modalButtonText: {
  fontWeight: 'bold',
  color: '#007AFF',
},
  });

export default ExplorePage;
