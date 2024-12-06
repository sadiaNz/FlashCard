import React, { useState, useEffect } from 'react';
import './App.css';
import { FaPlus, FaSearch, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';

const categoryColors = {
  Math: '#ffad33',
  History: '#33adff',
  Science: '#33ff57',
  Uncategorized: '#b3b3b3'
};

function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quizMode, setQuizMode] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [student, setStudent] = useState(null);
  const [quizResults, setQuizResults] = useState({ correct: 0, incorrect: 0 });
  const [profilePic, setProfilePic] = useState(null);
  const [isLogin, setIsLogin] = useState(true); // Track if it's login or registration form
  const [enteredUsername, setEnteredUsername] = useState('');
  const [enteredPassword, setEnteredPassword] = useState('');

  useEffect(() => {
    const savedFlashcards = JSON.parse(localStorage.getItem('flashcards'));
    const savedStudent = JSON.parse(localStorage.getItem('student'));

    if (savedFlashcards) setFlashcards(savedFlashcards);
    if (savedStudent) {
      setStudent(savedStudent);
      setProfilePic(savedStudent.profilePic || 'https://via.placeholder.com/150');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
    if (student) {
      localStorage.setItem('student', JSON.stringify(student));
    }
  }, [flashcards, student]);

  const registerStudent = () => {
    const name = prompt("Enter your name:");
    const emailInput = prompt("Enter your email:");
    const password = prompt("Set a password:");
    if (!validateEmail(emailInput)) {
      alert('Please enter a valid email address');
      return;
    }

    const profilePicUrl = prompt("Upload profile picture by selecting from your device:");

    if (name && emailInput && password) {
      const newStudent = {
        name,
        email: emailInput,
        password,  // Store password securely
        quizzesTaken: 0,
        totalCorrect: 0,
        profilePic: profilePicUrl || 'https://via.placeholder.com/150'
      };
      setStudent(newStudent);
      setProfilePic(newStudent.profilePic);
      localStorage.setItem('student', JSON.stringify(newStudent));
      alert("Registration Successful!");
      setIsLogin(true);  // Automatically switch to login after registration
    }
  };
  const loginStudent = () => {
    const storedStudent = JSON.parse(localStorage.getItem('student'));
    console.log("Stored Student Data: ", storedStudent); // Debug: Check what is stored
  
    const trimmedUsername = enteredUsername.trim().toLowerCase();
    const storedUsername = storedStudent?.name?.toLowerCase();
  
    console.log("Entered Username: ", trimmedUsername); // Debug: Log entered username
    console.log("Stored Username: ", storedUsername); // Debug: Log stored username
  
    if (storedStudent && storedUsername === trimmedUsername && storedStudent.password === enteredPassword) {
      console.log("Login Successful"); // Debug: Confirm successful login
      setStudent(storedStudent);
      setProfilePic(storedStudent.profilePic);
      setIsLogin(true); // Set login mode
      setEnteredUsername(''); // Clear entered username
      setEnteredPassword(''); // Clear entered password
    } else {
      console.log("Login Failed"); // Debug: Login failure
      alert("Incorrect username or password. Please try again.");
    }
  };
  
  

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const logout = () => {
    setStudent(null);
    setProfilePic(null);
    setIsLogin(false); // Set login form to be shown after logout
    localStorage.removeItem('student');
    localStorage.removeItem('flashcards');
  };

  const addFlashcard = () => {
    const question = prompt("Enter the question:");
    const answer = prompt("Enter the answer:");

    if (question && answer) {
      const newFlashcard = { question, answer, category: newCategory || 'Uncategorized' };
      setFlashcards([...flashcards, newFlashcard]);
      setNewCategory('');
    }
  };

  const deleteFlashcard = (index) => {
    const updatedFlashcards = flashcards.filter((_, i) => i !== index);
    setFlashcards(updatedFlashcards);
  };

  const filteredFlashcards = selectedCategory === 'All'
    ? flashcards.filter(flashcard => flashcard.question.toLowerCase().includes(searchQuery.toLowerCase()))
    : flashcards.filter(flashcard => flashcard.category === selectedCategory && flashcard.question.toLowerCase().includes(searchQuery.toLowerCase()));

  const allCategories = ['All', ...new Set(flashcards.map(flashcard => flashcard.category))];

  const toggleQuizMode = () => {
    setQuizMode(!quizMode);
    setCurrentFlashcardIndex(0);
    setQuizResults({ correct: 0, incorrect: 0 });
  };

  const nextFlashcard = (isCorrect) => {
    if (isCorrect) {
      setQuizResults({ ...quizResults, correct: quizResults.correct + 1 });
    } else {
      setQuizResults({ ...quizResults, incorrect: quizResults.incorrect + 1 });
    }
    setCurrentFlashcardIndex((prevIndex) => (prevIndex + 1) % filteredFlashcards.length);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newProfilePic = URL.createObjectURL(file);
      setProfilePic(newProfilePic); 
      const updatedStudent = { ...student, profilePic: newProfilePic };
      setStudent(updatedStudent);
      localStorage.setItem('student', JSON.stringify(updatedStudent)); 
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Flashcard App</h1>
        <div className="action-buttons">
          {!student ? (
            <div>
              {isLogin ? (
                <>
                  <input 
                    type="text"
                    placeholder="Enter your username"
                    value={enteredUsername}
                    onChange={(e) => setEnteredUsername(e.target.value)} 
                  />
                  <input 
                    type="password"
                    placeholder="Enter your password"
                    value={enteredPassword}
                    onChange={(e) => setEnteredPassword(e.target.value)} 
                  />
                  <button className="btn" onClick={loginStudent}>Login</button>
                  <p>Don't have an account? <button onClick={() => setIsLogin(false)}>Register</button></p>
                </>
              ) : (
                <>
                  <button className="btn" onClick={registerStudent}>Register</button>
                  <p>Already have an account? <button onClick={() => setIsLogin(true)}>Login</button></p>
                </>
              )}
            </div>
          ) : (
            <div className="profile-info">
              <label className="profile-pic-container">
                <img src={profilePic} alt="Profile" className="profile-pic" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="profile-pic-input"
                />
              </label>
              <p>Welcome, {student.name}</p>
              <button className="btn sign-out-btn" onClick={logout}><FaSignOutAlt /> Sign Out</button>
            </div>
          )}
          {student && (
            <>
              <button className="btn" onClick={addFlashcard}><FaPlus /> Add Flashcard</button>
              <button className="btn" onClick={toggleQuizMode}><FaQuestionCircle /> {quizMode ? 'Exit Quiz Mode' : 'Start Quiz Mode'}</button>
            </>
          )}
        </div>

        <div className="filter-container">
          <input
            type="text"
            placeholder="Add Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="category-input"
          />
          <select onChange={(e) => setSelectedCategory(e.target.value)} value={selectedCategory} className="category-select">
            {allCategories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
          <div className="search-container">
            <FaSearch />
            <input
              type="text"
              placeholder="Search Flashcards"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </header>

      {quizMode ? (
        <div className="quiz-container">
          <h2>Quiz Mode</h2>
          <div className="flashcard">
            <p><strong>Question:</strong> {filteredFlashcards[currentFlashcardIndex]?.question}</p>
            <button className="btn" onClick={() => nextFlashcard(true)}>Correct</button>
            <button className="btn" onClick={() => nextFlashcard(false)}>Incorrect</button>
            <p><strong>Answer:</strong> {filteredFlashcards[currentFlashcardIndex]?.answer}</p>
            <p><strong>Progress:</strong> {quizResults.correct} Correct, {quizResults.incorrect} Incorrect</p>
          </div>
        </div>
      ) : (
        <div className="flashcard-container">
          {student && filteredFlashcards.map((flashcard, index) => (
            <div className="flashcard-card" key={index} style={{ backgroundColor: categoryColors[flashcard.category] || '#fff' }}>
              <h3>{flashcard.category}</h3>
              <p><strong>Question:</strong> {flashcard.question}</p>
              <p><strong>Answer:</strong> {flashcard.answer}</p>
              <div className="flashcard-actions">
                <button className="btn" onClick={() => deleteFlashcard(index)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
