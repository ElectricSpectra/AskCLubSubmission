importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/9.1.3/firebase-messaging.js");

// Initialize Firebase in the service worker
// Firebase configuration
const firebaseConfig = {
//your config
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage(function(payload) {
    console.log("Received background message: ", payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
