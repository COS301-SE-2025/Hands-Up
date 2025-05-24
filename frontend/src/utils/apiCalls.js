export const getLearningProgress = async (username) => {
   try {
    const response = await fetch(`http://localhost:2000/handsUPApi/learning/progress/${username}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting progress", error);
    return null;
  }
};

//import { Vote, GetVote } from '../../../../../libs/api-client';