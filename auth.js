// Import the Firebase SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging.js";


// Firebase configuration
const firebaseConfig = {
     //add in your config
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Reference to the Google login button
const googleLoginButton = document.querySelector('.google-login-button');

// Function to handle Google login
function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log("User signed in:", user.displayName);
            updateUI(user); // Update UI after login

            // Redirect to mainpage.html after 2 seconds
            setTimeout(() => {
                window.location.href = "mainpage.html";
            }, 2000); // 2000 milliseconds = 2 seconds
        })
        .catch((error) => {
            console.error("Error during sign-in:", error);
        });
}

// Update UI with user details after login
function updateUI(user) {
    if (user) {
        document.querySelector('.welcome-text h1').innerText = `Welcome, ${user.displayName}!`;
        googleLoginButton.style.display = 'none';
    } else {
        document.querySelector('.welcome-text h1').innerHTML = "Welcome to AskClub – where questions fuel <span class='highlight'>growth</span> & <span class='highlight'>collaboration</span> drives solutions.";
        googleLoginButton.style.display = 'block';
    }
}


// Event listener for the login button
googleLoginButton.addEventListener('click', loginWithGoogle);

// Check if user is already signed in
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User already signed in:", user.displayName);
        updateUI(user);

        // Redirect if not already on mainpage.html
        if (window.location.pathname !== "/mainpage.html") {
            window.location.href = `mainpage.html?timestamp=${new Date().getTime()}`;
        }
    } else {
        console.log("No user signed in.");
        updateUI(null);
    }
});
// Initialize Messaging
const messaging = getMessaging(app);

// Request Notification Permissions
async function requestNotificationPermission() {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
        console.log("Notification permission granted.");
        await getFCMToken();
    } else {
        console.error("Notification permission denied.");
    }
}

// Get the FCM Token
async function getFCMToken() {
    try {
        const token = await getToken(messaging, {
            vapidKey: "BNPaFkj0tyTSiLF_eCsBT4j3z5gQpVpZRE6L3qMe3T4I8wNisjOQuBei37MH4FGb1Umu938eVWBq3tksnk7V4mw",
        });
        if (token) {
            console.log("FCM Token:", token);

            // Save the token to your database
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, { fcmToken: token });
        }
    } catch (error) {
        console.error("Error getting FCM token:", error);
    }
}

// Call this function when the user logs in or opens the app
requestNotificationPermission();

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/firebase-messaging-sw.js")
        .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((err) => {
            console.error("Service Worker registration failed:", err);
        });
}

// Assuming Firebase is already initialized in auth.js
onMessage(messaging, (payload) => {
    console.log("Message received in foreground:", payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
    };

    new Notification(notificationTitle, notificationOptions);
});
