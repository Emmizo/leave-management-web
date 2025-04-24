importScripts('https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.0/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyD8iiuQsKlT8hpBM5dNYTCA7t1cXyxjADI",
  authDomain: "leave-management-6da00.firebaseapp.com",
  projectId: "leave-management-6da00",
  storageBucket: "leave-management-6da00.firebasestorage.app",
  messagingSenderId: "865726322217",
  appId: "1:865726322217:web:7cbac05379cbe573f22e38",
  measurementId: "G-EJT3ETH7FM"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/ist-logo.png',
    badge: '/ist-logo.png',
    vibrate: [200, 100, 200],
    tag: 'notification-' + Date.now()
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('Service worker installed');
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  event.waitUntil(clients.claim());
}); 