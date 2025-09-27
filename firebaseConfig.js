
import { initializeApp } from "@firebase/app";
import { getDatabase } from "@firebase/database"; // Include if you're using Realtime Database

const firebaseConfig = {
  apiKey: 'AIzaSyD62tSFG6HKJp2oTUrl3EHSn4EOtXoevB8',
  authDomain: 'hillrange-booking-sheet.firebaseapp.com',
  projectId: 'hillrange-booking-sheet',
  databaseURL: 'https://hillrange-booking-sheet-default-rtdb.firebaseio.com',
  storageBucket: 'hillrange-booking-sheet.appspot.com',
  messagingSenderId: '916259722613',
  appId: '1:916259722613:web:04716b42e862b396fc2f3c',
  measurementId: 'G-JHDDKK97MN',
};

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app); // Example for Realtime Database
export default app;
