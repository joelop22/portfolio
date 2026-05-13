const firebaseConfig = {
    apiKey: "AIzaSyAd_pv5_yirT1ZC1uH7JyfAT6cLBt1rcgE",
    authDomain: "portfolio-j-e7b0c.firebaseapp.com",
    projectId: "portfolio-j-e7b0c",
    storageBucket: "portfolio-j-e7b0c.firebasestorage.app",
    messagingSenderId: "112418291991",
    appId: "1:112418291991:web:578f067208c6a288ba7752",
    measurementId: "G-FMVC4YQQ45"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore();
