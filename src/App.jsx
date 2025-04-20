// src/App.js

import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./App.css";

function App() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [timeRemaining, setTimeRemaining] = useState({});

  useEffect(() => {
    // Load initial state from cookies
    const storedGoals = Cookies.get("goals");
    console.log(storedGoals);
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
  }, []);

  useEffect(() => {
    // Save goals to cookies
    Cookies.set("goals", JSON.stringify(goals), { expires: 365 });

    // Set up an interval to update the remaining times every second
    const interval = setInterval(() => {
      updateRemainingTimes();
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, [goals]);

  const updateRemainingTimes = () => {
    const newTimeRemaining = {};
    goals.forEach((goal, index) => {
      newTimeRemaining[index] = calculateTimeRemaining(goal);
    });
    setTimeRemaining(newTimeRemaining);
  };

  const calculateTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const difference = end - now;

    if (difference <= 0) {
      return "Goal Time Reached!";
    }

    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const addGoal = () => {
    if (newGoal) {
      setGoals([...goals, new Date(newGoal).toISOString()]);
      setNewGoal("");
    }
  };

  const removeGoal = (index) => {
    const newGoals = goals.filter((_, i) => i !== index);
    setGoals(newGoals);
    const updatedTimeRemaining = Object.keys(timeRemaining)
      .filter((key) => Number(key) !== index)
      .reduce((obj, key) => {
        obj[key > index ? key - 1 : key] = timeRemaining[key];
        return obj;
      }, {});
    setTimeRemaining(updatedTimeRemaining);
  };

  return (
    <div className="App">
      <h1>Countdown Timer</h1>
      <input
        type="datetime-local"
        value={newGoal}
        onChange={(e) => setNewGoal(e.target.value)}
      />
      <button onClick={addGoal}>Add Goal</button>
      <div>
        {goals.map((goal, index) => (
          <div key={index}>
            <h3>Goal {index + 1}</h3>
            <p>{timeRemaining[index]}</p>
            <button onClick={() => removeGoal(index)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
