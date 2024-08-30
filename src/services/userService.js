import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Function to create user profile and username mapping
export const createUserProfile = async (user) => {
    try {
        // Set the user profile in the users collection
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            username: user.username
        });

        // Create a mapping in the usernames collection
        await setDoc(doc(db, "uids", user.uid), {
            username: user.username
        });

        console.log("User profile and username mapping created successfully!");
    } catch (error) {
        console.error("Error creating user profile or mapping", error);
    }
};

// Function to get username from UID
export const getUsernameFromUID = async (uid) => {
    try {
        // Query the users collection by UID
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return userDoc.data().username;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching username:", error);
    }
};