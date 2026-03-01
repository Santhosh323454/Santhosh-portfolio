import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { mockDb } from '../services/mockDb';

export function useRealtimeData(key) {
    const [data, setData] = useState(() => mockDb.getData(key));

    useEffect(() => {
        // Subscribe to real-time changes from Firestore
        // Using specific collection: 'portfolioData' and specific doc ID: 'ztqRJzp4Qr0UqNqD0MOp'
        const docRef = doc(db, 'portfolioData', 'ztqRJzp4Qr0UqNqD0MOp');

        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const fetchedData = docSnap.data();
                if (fetchedData && fetchedData[key]) {
                    setData(fetchedData[key]);
                } else {
                    // Initialize this specific key in the document if it doesn't exist yet
                    const defaultData = mockDb.getData(key);
                    setDoc(docRef, { [key]: defaultData }, { merge: true }).catch(err => {
                        console.error(`Firebase Initialization Error for ${key}:`, err);
                    });
                    setData(defaultData);
                }
            } else {
                // Initialize the entire document with default data if it doesn't exist
                const defaultData = mockDb.getData(key);
                setDoc(docRef, { [key]: defaultData }, { merge: true }).catch(err => {
                    console.error("Firebase Document Creation Error:", err);
                });
                setData(defaultData);
            }
        }, (error) => {
            console.error("Firestore listening error:", error);
        });

        return () => unsubscribe();
    }, [key]);

    const update = async (newData) => {
        // Optimistic update locally
        setData(newData);

        // Firestore does not accept undefined values. We strip them out.
        const sanitizedData = JSON.parse(JSON.stringify(newData));

        try {
            const docRef = doc(db, 'portfolioData', 'ztqRJzp4Qr0UqNqD0MOp');
            // Persist to Firestore under the specific key with merge: true
            await setDoc(docRef, { [key]: sanitizedData }, { merge: true });
            console.log('Firebase Save Success');
        } catch (error) {
            console.error('Firebase Save Error:', error);
            // Optionally, we can rethrow to let the caller handle the alert.
            throw error;
        }
    };

    return [data, update];
}
