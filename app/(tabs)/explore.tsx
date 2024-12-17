import React, { useState, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebaseConfig'; // Ensure the correct Firebase config path

const ExplorePage: React.FC = () => {
  const [bookingData, setBookingData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | null>(useColorScheme());
  const styles = getStyles(colorScheme);

  useEffect(() => {
    const bookingsRef = ref(database, 'bookings');
    const unsubscribe = onValue(
      bookingsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const teachers = data.teachers || {}; // Corrected the path to 'teachers'
          const bookings = data.data || {};
  
          const validRows = Object.values(bookings).filter((row: any) => row.name && row.remark);
  
          const rowsWithTeachers = validRows.map((row: any) => {
            let matchedTeacher = 'Unknown';
          
            // Search for teacherName match in the teachers object
            for (const key in teachers) {
              if (teachers[key]?.teacherName?.toLowerCase() === row.teacherName?.toLowerCase()) {
                matchedTeacher = teachers[key].teacherName;
                break;
              }
            }
          
            return { ...row, teacherName: matchedTeacher };
          });
          
          
  
          setBookingData(rowsWithTeachers);
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
  
    return () => unsubscribe();
  }, []);
  
  

  useEffect(() => {
    // Dynamic color scheme update
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });
    return () => subscription.remove(); // Cleanup
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fa0" />
      </View>
    );
  }

  if (!bookingData || bookingData.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No valid booking data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Details</Text>
      <FlatList
        data={bookingData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={styles.bookingText}>
            {item.name} was booked by Mr. {item.teacherName} for {item.remark}. He is in {item.class} and in team {item.team}.
          </Text>
        )}
      />
    </View>
  );
};

// Dynamic styles based on color scheme
const getStyles = (scheme: 'light' | 'dark' | null) =>
  StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: scheme === 'dark' ? '#121212' : '#fff', // Page background
      flex: 1, // Ensure the container takes full height
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
      fontSize: 18,
      marginVertical: 8,
      color: scheme === 'dark' ? '#ccc' : '#333', // Booking text color
    },
  });

export default ExplorePage;
