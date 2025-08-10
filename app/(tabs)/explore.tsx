import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebaseConfig';
import { useTheme } from '../../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ExplorePage: React.FC = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [bookingData, setBookingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyStats, setWeeklyStats] = useState<{ [cls: string]: { current: number, prev: number } }>({});
  const [detentions, setDetentions] = useState<string[]>([]);

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

      const todayStr = new Date().toISOString().split('T')[0];
      const todayBookings = Object.values(bookings)
        .filter((row: any) => row.name && row.remark && row.date?.startsWith(todayStr))
        .map((row: any) => {
          let matchedTeacher = 'Unknown';
          for (const key in teachers) {
            if (teachers[key]?.teacherName?.toLowerCase() === row.teacherName?.toLowerCase()) {
              matchedTeacher = teachers[key].teacherName;
              break;
            }
          }
          return { ...row, teacherName: matchedTeacher };
        });

      setBookingData(todayBookings);

      // Weekly analysis
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const prevWeekAgo = new Date();
      prevWeekAgo.setDate(prevWeekAgo.getDate() - 14);

      let currentWeek: { [cls: string]: number } = {};
      let prevWeek: { [cls: string]: number } = {};
      let studentCount: { [name: string]: number } = {};

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
            {
              current: currentWeek[cls] || 0,
              prev: prevWeek[cls] || 0
            }
          ])
        )
      );

      setDetentions(Object.keys(studentCount).filter(name => studentCount[name] >= 3));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fa0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sun/Moon Toggle */}
      <TouchableOpacity onPress={toggleTheme} style={{ marginBottom: 12, alignSelf: 'flex-end' }}>
        <Text style={{ fontSize: 20 }}>
          {darkMode ? "🌞" : "🌙"}
        </Text>
      </TouchableOpacity>

      {/* Analysis Bar */}
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
  {/* Header */}
  <View style={styles.tableHeader}>
    <Text style={[styles.headerCell, { flex: 2 }]}>Student</Text>
    <Text style={[styles.headerCell, { flex: 2 }]}>Teacher</Text>
    <Text style={[styles.headerCell, { flex: 1 }]}>Class</Text>
    <Text style={[styles.headerCell, { flex: 1 }]}>Team</Text>
    <Text style={[styles.headerCell, { flex: 3 }]}>Remark</Text>
  </View>

  {/* Scrollable body */}
  <ScrollView style={{ maxHeight: 300 }}>
    {bookingData.map((item, index) => (
      <View style={styles.tableRow} key={index}>
        <Text style={[styles.cell, { flex: 2 }]}>{item.name}</Text>
        <Text style={[styles.cell, { flex: 2 }]}>{item.teacherName}</Text>
        <Text style={[styles.cell, { flex: 1 }]}>{item.class}</Text>
        <Text style={[styles.cell, { flex: 1 }]}>{item.team}</Text>
        <Text style={[styles.cell, { flex: 3 }]}>{item.remark}</Text>
      </View>
    ))}
  </ScrollView>
      </ScrollView>
    </View>
  );
};

const getStyles = (dark: boolean) =>
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
  });

export default ExplorePage;
