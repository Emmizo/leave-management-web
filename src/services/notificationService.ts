import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { toast } from 'react-toastify';

// Basic Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD8iiuQsKlT8hpBM5dNYTCA7t1cXyxjADI",
  authDomain: "leave-management-6da00.firebaseapp.com",
  projectId: "leave-management-6da00",
  storageBucket: "leave-management-6da00.firebasestorage.app",
  messagingSenderId: "865726322217",
  appId: "1:865726322217:web:7cbac05379cbe573f22e38",
  measurementId: "G-EJT3ETH7FM"
};

// VAPID key for web push notifications
// To get your VAPID key:
// 1. Go to Firebase Console -> Project Settings -> Cloud Messaging
// 2. Scroll to "Web Push certificates" section
// 3. Click "Generate Key Pair" if you haven't already
// 4. Copy the generated key pair
const VAPID_KEY = ""; // Replace with your VAPID key from Firebase Console

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission for notifications
export const requestNotificationPermission = async () => {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      throw new Error('Notifications are not supported in this browser');
    }

    // Check if service worker is supported
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported in this browser');
    }

    // Check if VAPID key is properly set
    if (!VAPID_KEY) {
      throw new Error('VAPID key is not configured. Please follow the instructions in notificationService.ts to get your VAPID key from Firebase Console.');
    }

    // Request permission
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    
    if (permission === 'granted') {
      try {
        // Get FCM token with VAPID key
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY
        });
        console.log('FCM Token:', token);
        return token;
      } catch (tokenError) {
        console.error('Error getting FCM token:', tokenError);
        throw new Error('Failed to get FCM token. Please check your VAPID key configuration.');
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    throw error;
  }
};

// Handle incoming messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Received message:', payload);
      const { title, body } = payload.notification || {};
      
      // Show toast notification
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

// Send notification (for testing)
export const sendNotification = async (token: string, title: string, body: string) => {
  try {
    console.log('Sending test notification to token:', token);
    console.log('Title:', title);
    console.log('Body:', body);
    
    // For testing, just log the notification details
    return {
      success: true,
      message: 'Test notification sent (logged to console)'
    };
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