// src/lib/notifications/store.ts

import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { logInfo, logWarn } from '@/lib/log';
import type { NotificationPayloadBase } from './types';

export async function logNotification(
  payload: NotificationPayloadBase & Record<string, unknown>
): Promise<string> {
  try {
    const notificationDoc = {
      ...payload,
      deliveryStatus: 'pending',
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'notifications'), notificationDoc);
    
    logInfo('notifications/store/logNotification', {
      notificationId: docRef.id,
      eventType: payload.eventType,
    });

    return docRef.id;
  } catch (error) {
    logWarn('notifications/store/logNotification failed', error);
    throw error;
  }
}
