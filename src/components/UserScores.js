import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const UserScores = () => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const fetchScores = async () => {
      const q = query(collection(db, 'quizScores'), orderBy('score', 'desc'));
      const querySnapshot = await getDocs(q);

      const scoresList = await Promise.all(
        querySnapshot.docs.map(async (scoreDoc) => {
          const data = scoreDoc.data();
          // Fetch the username from the /users collection using the userId
          const userRef = doc(db, 'users', data.userId);
          const userSnap = await getDoc(userRef);

          // If the user document exists, add the username to the score data
          if (userSnap.exists()) {
            data.username = userSnap.data().username;
          } else {
            data.username = 'Unknown User';
          }

          return data;
        })
      );

      setScores(scoresList);
    };

    fetchScores();
  }, []);

  return (
    <div>
      <h2>Top Scores</h2>
      <ul>
        {scores.map((score, index) => (
          <li key={index}>
            {/* Display the username, score, total score, and the quiz date */}
            {score.username}: {score.score}/{score.totalScore} on {score.quizDate}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserScores;
