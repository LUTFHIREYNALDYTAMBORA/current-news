import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';

function StartFirebase() {
    const firebaseConfig = {
      apiKey: "AIzaSyA_R2q-qvZAvEsOZKbKtrhos5DQZo10-2g",
      authDomain: "current-news-b09b9.firebaseapp.com",
      projectId: "current-news-b09b9",
      storageBucket: "current-news-b09b9.firebasestorage.app",
      messagingSenderId: "269064108025",
      appId: "1:269064108025:web:e59efa8f3cf8e140176f28"
    };

    const app = initializeApp(firebaseConfig);
    return getDatabase(app);
}

export default StartFirebase;
