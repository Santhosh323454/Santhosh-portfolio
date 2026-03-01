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
            // Specifically targeting the document the user requested
            const docRef = doc(db, 'portfolioData', 'ztqRJzp4Qr0UqNqD0MOp');

            // According to the user's snippet, we map formData explicitly to a 'profile' object inside the document if key is 'profile'.
            // Or generically, we wrap the updated object under its key.
            const dataToSet = {
                [key]: sanitizedData
            };

            await setDoc(docRef, dataToSet, { merge: true });

            console.log('Firebase Update Success');
        } catch (error) {
            console.error('Firebase Update Error:', error);
            throw error;
        }
    };

    return [data, update];
}
