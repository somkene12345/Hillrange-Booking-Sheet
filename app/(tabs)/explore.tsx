import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { database } from '../../firebaseConfig';

export default function TabTwoScreen() {
  const [bookingData, setBookingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyStats, setWeeklyStats] = useState<{ [cls: string]: { current: number, prev: number } }>({});
  const [detentions, setDetentions] = useState<string[]>([]);

  const styles = getStyles();

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
        <ParallaxScrollView headerBackgroundColor={{ light: '#fa0', dark: '#fa0' }}
          headerImage={
            <Image
              source={require('@/assets/images/partial-react-logo.png')}
              style={styles.reactLogo}
            />
          }>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Hillrange Booking Sheet</ThemedText>
          </ThemedView>
    <View style={styles.container}>

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
    <Text style={[styles.headerCell, { flex: 3 }]}>Time</Text>

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
        <Text style={[styles.cell, { flex: 3 }]}>
  {new Date(item.date).toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}
</Text>


      </View>
    ))}
  </ScrollView>
    </View>
    </View>
    </ParallaxScrollView>
  );
};

const getStyles = () =>
  StyleSheet.create({
    reactLogo: {
    height: 178,
    width: 290,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
    titleContainer: {
    marginTop: 20,
    textAlign: 'center',
  },
    container: {
      padding: 20,
      backgroundColor: '#fff',
      flex: 1,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    analysisBar: {
      padding: 10,
      backgroundColor: '#f5f5f5',
      marginBottom: 10,
      borderRadius: 5,
    },
    analysisText: {
      color: '#000',
      fontSize: 14,
    },
    detentionText: {
      color: 'red',
      marginBottom: 10,
      fontWeight: 'bold',
    },
    table: {
    padding: 10,
    backgroundColor: '#f5f5f5',
  marginBottom: 10,
  borderRadius: 5,
},
tableHeader: {
  flexDirection: 'row',
  backgroundColor: '#e6e6e6',
  borderColor: '#ccc',
  borderBottomWidth: 1,
},
headerCell: {
  padding: 8,
  fontWeight: 'bold',
  color: '#000',
},
tableRow: {
  flexDirection: 'row',
  borderBottomWidth: 1,
  borderColor: '#ccc',
},
cell: {
  padding: 8,
  color: '#333',
},
  });

