import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { toast } from 'react-toastify';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8iiuQsKlT8hpBM5dNYTCA7t1cXyxjADI",
  authDomain: "leave-management-6da00.firebaseapp.com",
  projectId: "leave-management-6da00",
  storageBucket: "leave-management-6da00.firebasestorage.app",
  messagingSenderId: "865726322217",
  appId: "1:865726322217:web:7cbac05379cbe573f22e38",
  measurementId: "G-EJT3ETH7FM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const functions = getFunctions(app);
const sendNotificationFunction = httpsCallable(functions, 'sendNotification');

// Notification state management
let notificationCallback: ((count: number) => void) | null = null;

export const setNotificationCallback = (callback: (count: number) => void) => {
  notificationCallback = callback;
};

// Request permission for notifications
export const requestNotificationPermission = async () => {
  try {
    console.log('Starting notification permission request...');
    
    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      console.error('Service Worker is not supported in this browser');
      throw new Error('Service Worker is not supported in this browser');
    }

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.error('Notifications are not supported in this browser');
      throw new Error('Notifications are not supported in this browser');
    }

    // Check if push messaging is supported
    if (!('PushManager' in window)) {
      console.error('Push messaging is not supported in this browser');
      throw new Error('Push messaging is not supported in this browser');
    }

    console.log('Checking notification permission status:', Notification.permission);
    
    // Register the service worker
    console.log('Registering service worker...');
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });

    console.log('Service worker registered:', registration);

    // Wait for the service worker to be ready
    console.log('Waiting for service worker to be ready...');
    await navigator.serviceWorker.ready;
    console.log('Service worker is ready');

    // Request notification permission
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('Notification permission status:', permission);
    
    if (permission === 'granted') {
      console.log('Notification permission granted, getting FCM token...');
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
      });
      console.log('FCM token obtained:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    if (error instanceof Error) {
      if (error.message.includes('MIME type')) {
        console.error('Service worker file is not being served with the correct MIME type. Please ensure your server is configured to serve .js files with the correct MIME type.');
      }
    }
    throw error;
  }
};

// Handle incoming messages when the app is in the foreground
export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Received foreground message:', payload);
      const { title, body } = payload.notification || {};
      
      // Update notification count
      if (notificationCallback) {
        notificationCallback(1);
      }
      
      toast.info(`${title}\n${body}`, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      resolve(payload);
    });
  });
};

// Send a notification using Firebase Cloud Function
export const sendNotification = async (
  token: string,
  title: string,
  body: string
) => {
  try {
    console.log('Sending notification to token:', token);
    
    const result = await sendNotificationFunction({ 
      token, 
      title, 
      body,
      icon: '/ist-logo.png',
      link: window.location.origin
    });
    
    console.log('Notification sent successfully:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Initialize notification listener for the application
 * Should be called in a top-level component (e.g., App.tsx)
 */
export const initializeNotifications = () => {
  console.log('Initializing notifications...');
  
  // Request permission when the app loads
  requestNotificationPermission()
    .then(token => {
      if (token) {
        console.log('Notification system initialized with token:', token);
        
        // Set up listener for foreground messages
        onMessageListener()
          .then(payload => {
            console.log('Foreground message handler set up:', payload);
          })
          .catch(err => console.error('Error setting up message listener:', err));
      } else {
        console.log('Notification system initialized but no token obtained');
      }
    })
    .catch(err => console.error('Error initializing notifications:', err));
}; 