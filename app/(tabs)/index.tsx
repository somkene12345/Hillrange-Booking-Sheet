import React, { useState } from 'react';
import { useColorScheme } from 'react-native';
import { Image, StyleSheet, ScrollView, TextInput, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ref, set, push, update } from 'firebase/database'; // Import Firebase methods
import { database } from './firebaseConfig'; // Import the initialized database



export default function HomeScreen() {
  const colorScheme = useColorScheme(); // Get the current color scheme
  const styles = getStyles(colorScheme);
  const navigation = useNavigation();
  const [teacherName, setTeacherName] = useState('');
  const [rows, setRows] = useState(
    Array.from({ length: 10 }, () => ({
      name: '',
      class: 'JS1A',
      team: 'amazon',
      remark: '',
    }))
  );

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleSubmit = () => {
    const bookingsRef = ref(database, 'bookings/data'); // Ensure data is stored under 'data'
  
    rows.forEach((row) => {
      if (row.name && row.remark) { // Validate non-empty fields
        const newBooking = {
          name: row.name,
          remark: row.remark,
          class: row.class,
          team: row.team,
        };
  
        push(bookingsRef, newBooking)
          .then(() => {
            console.log(`Booking for ${row.name} added successfully!`);
          })
          .catch((error) => {
            console.error('Error adding booking:', error);
          });
      }
    });
  
    const teacherNameRef = ref(database, 'data'); // Store the teacher name under 'data'
    update(teacherNameRef, { teacherName: teacherName })
      .then(() => console.log('Teacher name updated successfully!'))
      .catch((error) => console.error('Error updating teacher name:', error));
  
    // Navigate to the explore page after successful submission
    navigation.navigate('explore');
  };
  

  const renderRow = (id: number) => (
    <tr key={id}>
      <td style={styles.cell} color={{ light: '#ccc', dark: '#fff' }}>
        <TextInput
          placeholder="Enter Name"
          style={styles.input}
          value={rows[id - 1]?.name}
          onChangeText={(text) => handleInputChange(id - 1, 'name', text)}
        />
      </td>
      <td style={styles.cell}>
        <select
          style={styles.select}
          value={rows[id - 1]?.class}
          onChange={(e) => handleInputChange(id - 1, 'class', e.target.value)}
        >
          <option value="JS1A">JS1A</option>
          <option value="JS1B">JS1B</option>
          <option value="JS1C">JS1C</option>
          <option value="JS2A">JS2A</option>
          <option value="JS2B">JS2B</option>
          <option value="JS2C">JS2C</option>
          <option value="JS3A">JS3A</option>
          <option value="JS3B">JS3B</option>
          <option value="SS1A">SS1A</option>
          <option value="SS1B">SS1B</option>
          <option value="SS2A">SS2A</option>
          <option value="SS2B">SS2B</option>
          <option value="SS3A">SS3A</option>
          <option value="SS3B">SS3B</option>
        </select>
      </td>
      <td style={styles.cell}>
        <select
          style={styles.select}
          value={rows[id - 1]?.team}
          onChange={(e) => handleInputChange(id - 1, 'team', e.target.value)}
        >
          <option value="amazon">Amazon</option>
          <option value="danube">Danube</option>
          <option value="nile">Nile</option>
          <option value="zambezi">Zambezi</option>
        </select>
      </td>
      <td style={styles.cell}>
        <TextInput
          placeholder="Enter Remark"
          style={styles.input}
          value={rows[id - 1]?.remark}
          onChangeText={(text) => handleInputChange(id - 1, 'remark', text)}
        />
      </td>
    </tr>
  );

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

      {/* Teacher Name Input */}
      <View style={styles.teacherNameContainer}>
        <TextInput
          placeholder="Enter Teacher's Name"
          style={styles.input}
          value={teacherName}
          onChangeText={setTeacherName}
        />
      </View>
      
      <ThemedView>
        <ScrollView style={styles.tableContainer} horizontal>
          <form id="sheet">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th><ThemedText>Name</ThemedText></th>
                  <th><ThemedText>Class</ThemedText></th>
                  <th><ThemedText>Team</ThemedText></th>
                  <th><ThemedText>Remark</ThemedText></th>
                </tr>
              </thead>
              <tbody>{Array.from({ length: 10 }).map((_, index) => renderRow(index + 1))}</tbody>
            </table>
            <View style={styles.submitButtonContainer}>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </form>
        </ScrollView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
  reactLogo: {
    height: 178,
    width: 290,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  teacherNameContainer: {
    marginTop: 20,
    textAlign: 'center',
  },
  titleContainer: {
    marginTop: 20,
    textAlign: 'center',
  },
  tableContainer: {
    marginTop: 20,
    flex: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    textAlign: 'center',
    borderCollapse: 'collapse',
  },
  cell: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    borderRadius: 4,
    color: scheme === 'dark' ? '#fff' : '#000', // Text color based on theme
    backgroundColor: scheme === 'dark' ? '#333' : '#fff', // Input background
  },
  select: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    borderRadius: 4,
    color: scheme === 'dark' ? '#fff' : '#000', // Dropdown text color
    backgroundColor: scheme === 'dark' ? '#333' : '#fff', // Dropdown background
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#fa0',
    padding: 10,
    borderRadius: 5,
  },
  submitButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
