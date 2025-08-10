import React, { useState, useEffect } from 'react';
import { Appearance, useColorScheme } from "react-native";
import { Image, StyleSheet, ScrollView, TextInput, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ref, push, get } from 'firebase/database'; // Import Firebase methods
import { database } from '../../firebaseConfig'; // Import the initialized database
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../theme/ThemeContext';


export default function HomeScreen() {
  const { darkMode, toggleTheme } = useTheme();
  const styles = getStyles(darkMode);
  const navigation = useNavigation();
const [teachers, setTeachers] = useState([]);
const [loading, setLoading] = useState(true);
const [teacherName, setTeacherName] = useState('');
const [teacherId, setTeacherId] = useState(null);

// Prefill teacherName from AsyncStorage
useEffect(() => {
  const loadTeacherName = async () => {
    try {
      const storedName = await AsyncStorage.getItem('teacherName');
      if (storedName) setTeacherName(storedName);
    } catch (err) {
      console.error('Error loading stored teacherName:', err);
    }
  };
  loadTeacherName();
}, []);

  const [rows, setRows] = useState(
    Array.from({ length: 1 }, () => ({
      name: '',
      class: 'JS1A',
      team: 'amazon',
      remark: '',
    }))
  );



  // Fetch teacher data from Firebase on mount
  useEffect(() => {
    const teachersRef = ref(database, 'bookings/teachers');
    get(teachersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setTeachers(Object.values(data)); // Store teachers' data
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching teachers:', error);
        setLoading(false);
      });
  }, []);

  // Update teacherId when teacherName changes
const handleTeacherNameChange = (text) => {
  const trimmedText = text.trim();
  setTeacherName(trimmedText);

  const matchedTeacher = teachers.find(
    (teacher) =>
      teacher.teacherName.toLowerCase() === trimmedText.toLowerCase()
  );

  if (matchedTeacher) {
    setTeacherId(trimmedText);
  } else {
    setTeacherId(null);
  }
};
  

  const handleInputChange = (index: number, field: string, value: string) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

const handleSubmit = async () => {
  const bookingsRef = ref(database, 'bookings/data');
  const validRows = rows.filter((row) => row.name && row.remark);
  let successCount = 0;
  let errorCount = 0;

  if (validRows.length === 0) {
    Toast.show({
      type: 'error',
      text1: 'Submission Error',
      text2: 'No valid data to submit.',
      position: 'bottom',
      bottomOffset: 50,
    });
    return;
  }

  if (!teacherName.trim()) {
    Toast.show({
      type: 'error',
      text1: 'Teacher Error',
      text2: 'Please enter a teacher name.',
      position: 'bottom',
      bottomOffset: 50,
    });
    return;
  }

  // Save teacher name locally
  try {
    await AsyncStorage.setItem('teacherName', teacherName.trim());
  } catch (err) {
    console.error('Error saving teacherName to storage:', err);
  }

  const timestamp = new Date().toISOString();

  validRows.forEach((row) => {
    const newBooking = {
      name: row.name,
      remark: row.remark,
      class: row.class,
      team: row.team,
      teacherName: teacherName.trim(),
      date: timestamp,
    };

    push(bookingsRef, newBooking)
      .then(() => {
        successCount++;
        if (successCount + errorCount === validRows.length) {
          Toast.show({
            type: 'success',
            text1: 'Submission Successful',
            text2: `${successCount} booking(s) added successfully.`,
            position: 'bottom',
            bottomOffset: 50,
          });
          navigation.navigate('explore');
        }
      })
      .catch(() => {
        errorCount++;
        if (successCount + errorCount === validRows.length) {
          Toast.show({
            type: 'error',
            text1: 'Submission Error',
            text2: `${errorCount} booking(s) failed to add.`,
            position: 'bottom',
            bottomOffset: 50,
          });
        }
      });
  });

  // Add teacher entry if new
  const teacherExists = teachers.some(
    (teacher) =>
      teacher.teacherName.toLowerCase() === teacherName.toLowerCase()
  );

  if (!teacherExists) {
    push(ref(database, 'bookings/teachers'), {
      teacherName: teacherName.trim(),
      dateAdded: timestamp,
    })
      .then(() => {
        Toast.show({
          type: 'success',
          text1: 'Teacher Added',
          text2: teacherName.trim(),
          position: 'bottom',
          bottomOffset: 50,
        });
      })
      .catch((error) => {
        console.error('Error adding teacher:', error);
        Toast.show({
          type: 'error',
          text1: 'Teacher Submission Failed',
          text2: error.message,
          position: 'bottom',
          bottomOffset: 50,
        });
      });
  }
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

  const toastConfig = {
    success: ({ text1, text2 }) => (
      <View style={styles.toastSuccess}>
        <Text style={styles.toastText}>{text1}</Text>
        {text2 && <Text style={styles.toastSubText}>{text2}</Text>}
      </View>
    ),
    error: ({ text1, text2 }) => (
      <View style={styles.toastError}>
        <Text style={styles.toastText}>{text1}</Text>
        {text2 && <Text style={styles.toastSubText}>{text2}</Text>}
      </View>
    ),
  };

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
        className='teacherInput'
          placeholder="Enter Teacher's Name"
          style={styles.input}
          value={teacherName}
          onChangeText={handleTeacherNameChange} // Use the updated handler
        />
      </View>

      <ThemedView>
        <ScrollView style={styles.tableContainer} horizontal>
          <form action="" method="post" className="form">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.header}><ThemedText>Name</ThemedText></th>
                  <th style={styles.header}><ThemedText>Class</ThemedText></th>
                  <th style={styles.header}><ThemedText>Team</ThemedText></th>
                  <th style={styles.header}><ThemedText>Remark</ThemedText></th>
                </tr>
              </thead>
              <tbody>{Array.from({ length: 1 }).map((_, id) => renderRow(id + 1))}</tbody>
            </table>
          </form>
        </ScrollView>
      </ThemedView>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>

      <Toast config={toastConfig} />
    </ParallaxScrollView>
  );
}


const getStyles = (dark: boolean) => StyleSheet.create({
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
  header:{
    color: dark ? '#fff' : '#000' // Text color based on theme
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    borderRadius: 4,
    color: dark ? '#fff' : '#000', // Text color based on theme
    backgroundColor: dark ? '#333' : '#fff', // Input background
  },
  select: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    borderRadius: 4,
    color: dark ? '#fff' : '#000', // Dropdown text color
    backgroundColor: dark ? '#333' : '#fff', // Dropdown background
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16
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
  toastSuccess: {
    backgroundColor: 'rgba(0, 200, 0, 0.8)',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 20,
  },
  toastError: {
    backgroundColor: 'rgba(200, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 20,
  },
  toastText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toastSubText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  }
});
