
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./App.scss";

function App() {
  const [goals, setGoals] = useState([]);
  const [newGoalTime, setNewGoalTime] = useState("");
  const [newGoalName, setNewGoalName] = useState("");
  const [countdowns, setCountdowns] = useState({});
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const stored = Cookies.get("goals");
    if (stored) {
      setGoals(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    updateCountdowns();
    const interval = setInterval(() => {
      updateCountdowns();
    }, 1000);

    return () => clearInterval(interval);
  }, [goals]);

  const updateCountdowns = () => {
    const newCountdowns = {};
    goals.forEach((goal, index) => {
      newCountdowns[index] = calculateCountdown(goal.time);
    });
    setCountdowns(newCountdowns);
  };

  const calculateCountdown = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const difference = Math.abs(end - now);
    const past = end <= now;
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return `${past ? '+' : ''}${days > 0 ? `${days} days` : `${hours}:${minutes}:${seconds}`}`;
  };

  const addGoal = () => {
    if (newGoalTime && newGoalName) {
      const newGoals = [...goals, { name: newGoalName, time: new Date(newGoalTime).toISOString() }];
      setGoals(newGoals);
      setNewGoalName("");
      setNewGoalTime("");
      Cookies.set("goals", JSON.stringify(newGoals), { expires: 365 });
      setModalOpen(false); // Close the modal after adding
    }
  };

  const removeGoal = (index) => {
    const newGoals = goals.filter((_, i) => i !== index);
    setGoals(newGoals);
    Cookies.set("goals", JSON.stringify(newGoals), { expires: 365 });

    const updatedCountdowns = Object.keys(countdowns)
      .filter((key) => Number(key) !== index)
      .reduce((obj, key) => {
        obj[key > index ? key - 1 : key] = countdowns[key];
        return obj;
      }, {});

    setCountdowns(updatedCountdowns);
  };

  return (
    <div className="App">
      <div className="countdowns">
        {goals.map((goal, index) => (
          <div key={index}>
            <h1>{countdowns[index]}</h1>
            <p>{goal.name} <button onClick={() => removeGoal(index)}>×</button></p>
            
          </div>
        ))}
      </div>
      <button className="add-button" onClick={() => setModalOpen(true)}>+</button>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModalOpen(false)}>&times;</span>
            <input
              type="text"
              placeholder="Name"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
            />
            <input
              type="datetime-local"
              value={newGoalTime}
              onChange={(e) => setNewGoalTime(e.target.value)}
            />
            <button className='add' onClick={addGoal}>Add</button>&nbsp;
            <button className='cancel' onClick={() => setModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;