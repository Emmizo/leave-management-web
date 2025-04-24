importScripts('https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.0/firebase-messaging-compat.js');

console.log('Service worker starting...');

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

console.log('Firebase initialized in service worker');

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message in service worker:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/ist-logo.png',
    badge: '/ist-logo.png',
    vibrate: [200, 100, 200],
    tag: 'notification-' + Date.now(),
    requireInteraction: true,
    data: {
      click_action: payload.notification.click_action || '/'
    }
  };

  console.log('Showing notification with options:', notificationOptions);
  
  return self.registration.showNotification(notificationTitle, notificationOptions)
    .then(() => console.log('Notification shown successfully'))
    .catch(error => console.error('Error showing notification:', error));
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();
  
  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: "window"
    }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data?.click_action || '/');
      }
    })
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