// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAaBAVCDN_Pgi3KkPDzRX4PGGgfdCyBhLU",
  authDomain: "fir-rtc-8e24b.firebaseapp.com",
  projectId: "fir-rtc-8e24b",
  storageBucket: "fir-rtc-8e24b.appspot.com",
  messagingSenderId: "640360723701",
  appId: "1:640360723701:web:c93b3a089005686a03c1bc"
};

// Initialize Firebase
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

export default storage;

// import {firebase} from 'firebase/app';
// import 'firebase/storage';

// const firebaseConfig = {
//   apiKey: "AIzaSyAaBAVCDN_Pgi3KkPDzRX4PGGgfdCyBhLU",
//   authDomain: "fir-rtc-8e24b.firebaseapp.com",
//   projectId: "fir-rtc-8e24b",
//   storageBucket: "fir-rtc-8e24b.appspot.com",
//   messagingSenderId: "640360723701",
//   appId: "1:640360723701:web:c93b3a089005686a03c1bc"
// };

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// const storage = firebase.storage();

// export default storage;
