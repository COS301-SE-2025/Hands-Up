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

export const updateLearningProgress = async (username, progressData) => {
   try {
    const response = await fetch(`http://localhost:2000/handsUPApi/learning/progress/${username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(progressData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating progress", error);
    return null;
  }
  
};

