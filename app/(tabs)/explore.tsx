import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebaseConfig';
import { useTheme } from '../../theme/themeContent';

const ExplorePage: React.FC = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [bookingData, setBookingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyStats, setWeeklyStats] = useState<{ [cls: string]: number }>({});
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
        } else if (bookingDate >= prevWeekAgo && bookingDate < weekAgo) {
          prevWeek[className] = (prevWeek[className] || 0) + 1;
        }

        // Detention check
        if (bookingDate >= weekAgo) {
          studentCount[row.name] = (studentCount[row.name] || 0) + 1;
        }
      });

      setWeeklyStats(
        Object.fromEntries(
          Object.keys(currentWeek).map(cls => [
            cls,
            currentWeek[cls] - (prevWeek[cls] || 0)
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
      <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
        <Text style={styles.themeButtonText}>
          Switch to {darkMode ? 'Light' : 'Dark'} Mode
        </Text>
      </TouchableOpacity>

      {/* Analysis Bar */}
      <View style={styles.analysisBar}>
        {Object.entries(weeklyStats).map(([cls, diff], i) => (
          <Text key={i} style={styles.analysisText}>
            {cls}: {diff >= 0 ? `+${diff}` : diff} bookings vs last week
          </Text>
        ))}
      </View>

      {detentions.length > 0 && (
        <Text style={styles.detentionText}>
          Detention: {detentions.join(', ')}
        </Text>
      )}

      {/* Table */}
      <ScrollView horizontal>
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Student</Text>
            <Text style={styles.headerCell}>Teacher</Text>
            <Text style={styles.headerCell}>Class</Text>
            <Text style={styles.headerCell}>Team</Text>
            <Text style={styles.headerCell}>Remark</Text>
          </View>
          <ScrollView style={{ maxHeight: 300 }}>
            {bookingData.slice(0, 3).map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.cell}>{item.name}</Text>
                <Text style={styles.cell}>{item.teacherName}</Text>
                <Text style={styles.cell}>{item.class}</Text>
                <Text style={styles.cell}>{item.team}</Text>
                <Text style={styles.cell}>{item.remark}</Text>
              </View>
            ))}
            {bookingData.slice(3).map((item, index) => (
              <View style={styles.tableRow} key={index + 3}>
                <Text style={styles.cell}>{item.name}</Text>
                <Text style={styles.cell}>{item.teacherName}</Text>
                <Text style={styles.cell}>{item.class}</Text>
                <Text style={styles.cell}>{item.team}</Text>
                <Text style={styles.cell}>{item.remark}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
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
    themeButton: {
      padding: 10,
      backgroundColor: dark ? '#333' : '#ddd',
      borderRadius: 5,
      marginBottom: 15,
    },
    themeButtonText: {
      color: dark ? '#fff' : '#000',
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
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: dark ? '#1f1f1f' : '#e6e6e6',
    },
    headerCell: {
      flex: 1,
      padding: 8,
      fontWeight: 'bold',
      color: dark ? '#fff' : '#000',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: dark ? '#333' : '#ccc',
    },
    cell: {
      flex: 1,
      padding: 8,
      color: dark ? '#ccc' : '#333',
    },
  });

export default ExplorePage;
