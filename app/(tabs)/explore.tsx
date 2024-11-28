import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from './firebaseConfig'; // Ensure the correct Firebase config path

const ExplorePage: React.FC = () => {
  const [bookingData, setBookingData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme(); // Get the current color scheme
  const styles = getStyles(colorScheme);

  useEffect(() => {
    const bookingsRef = ref(database, 'bookings');
    onValue(
      bookingsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data && data.data) {
          const validRows = Object.values(data.data).filter(
            (row: any) => row.name && row.remark
          );
          setBookingData({ teacherName: data.teacherName, rows: validRows });
        } else {
          setBookingData(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    );
  }, []);
  

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fa0" />
      </View>
    );
  }

  if (!bookingData || bookingData.rows.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No valid booking data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Details</Text>
      {bookingData.rows.map((row: any, index: number) => (
        <Text key={index} style={styles.bookingText}>
          {row.name} was booked by Mr. {bookingData.teacherName} for {row.remark}. He is in{' '}
          {row.class} and in team {row.team}.
        </Text>
      ))}
    </View>
  );
};

const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: scheme === 'dark' ? '#121212' : '#fff', // Page background
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: scheme === 'dark' ? '#fff' : '#000', // Title text color
  },
  bookingText: {
    fontSize: 20,
    marginVertical: 5,
    color: scheme === 'dark' ? '#ccc' : '#333', // Booking text color
  },
});


export default ExplorePage;
