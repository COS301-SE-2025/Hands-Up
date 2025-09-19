import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/authContext.js';
import { useLearningStats } from '../contexts/learningStatsContext';
import '../styles/home.css';
import homeImage from '../images/picture1.png';

// Imports for the 3D animation
import { Canvas } from '@react-three/fiber';

import { AngieSigns } from '../components/angieSigns';
import { LANDMARK_FILES } from '../landmarks/index.js';

// Hardcoded data for other sections
const features = [
    { id: 'translator', iconClass: 'fas fa-hand-paper', title: 'Translator', description: 'Instantly translate sign language into words or phrases with cutting-edge recognition.', link: '/translator' },
    { id: 'learn', iconClass: 'fas fa-book-open', title: 'Learn & Practice', description: 'Dive into interactive lessons, engaging quizzes, and practical exercises designed for all levels.', link: '/learn' },
    { id: 'profile', iconClass: 'fas fa-user-circle', title: 'Your Personalized Profile', description: 'Track your learning progress, manage your achievements, and customize your experience.', link: '/userProfile' },
];

export function Home(){
    const { currentUser, isLoggedIn, justSignedUp} = useAuth();
    const { stats } = useLearningStats() || {};

    // Updated state to hold the word and the landmark data for the sign of the day
    const [signOfTheDay, setSignOfTheDay] = useState(null);
    const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
    const carouselRef = useRef(null);

    const [animationKey, setAnimationKey] = useState(0);

    const lessonsCompleted = stats?.lessonsCompleted || 0;
    const signsLearned = stats?.signsLearned || 0;
    const practiseDays = stats?.streak || 0;
    const currentLevel = stats?.currentLevel || "Bronze";

    const TOTAL_LEVELS = 12;
    const LESSONS_PER_LEVEL = 30;
    const TOTAL_LESSONS = TOTAL_LEVELS * LESSONS_PER_LEVEL; 
    const TOTAL_SIGNS = 26;

    const calcLessonsCompleted = Math.min(lessonsCompleted, TOTAL_LESSONS);
    const calcSignsLearned = Math.min(signsLearned, TOTAL_SIGNS);
    const lessonProgress = (calcLessonsCompleted + calcSignsLearned) / (TOTAL_LESSONS + TOTAL_SIGNS) * 100;
    const completionPercentage = Math.min(100, Math.round(lessonProgress));

    useEffect(() => { 
        // 1. Randomly select a word from the list of files
        const randomIndex = Math.floor(Math.random() * LANDMARK_FILES.length);
        const randomWord = LANDMARK_FILES[randomIndex];
    
        // 2. Dynamically import the corresponding JSON file
        import(`../landmarks/${randomWord}.json`)
            .then(module => {
                const landmarkData = module.default; 
                console.log("Loaded landmark data:", landmarkData);
                // 3. Update the state with the word and the data
                setSignOfTheDay({
                    word: randomWord.charAt(0).toUpperCase() + randomWord.slice(1),
                    landmarks: landmarkData,
                    description: `Expand your vocabulary with today's sign! Keep practicing to master this word and many more.This is a dynamically loaded sign! The word is "${randomWord}".`,
                });
            })
            .catch(error => {
                console.error("Failed to load sign of the day data:", error);
                // Optionally set a fallback state or message here
            });
    
        const featureInterval = setInterval(() => {
            setActiveFeatureIndex(prevIndex => (prevIndex + 1) % features.length);
        }, 5000);
    
        return () => clearInterval(featureInterval);
    }, []);

    useEffect(() => {
        if (!signOfTheDay) return;
        
        // This timer will re-render the animation every 2.5 seconds
        // You can adjust this value to match your animation duration
        const animationTimer = setInterval(() => {
            setAnimationKey(prevKey => prevKey + 1);
        }, 2500); // 2500ms = 2.5 seconds, which should be the length of your animation

        // Clean up the timer when the component unmounts
        return () => clearInterval(animationTimer);
    }, [signOfTheDay]);

    const userFirstName = currentUser?.name?.split(' ')[0] || "Valued Learner";

    const getMedalClass = (level) => {
        switch (level.toLowerCase()) {
            case 'bronze': return 'fas fa-medal bronze-medal';
            case 'silver': return 'fas fa-medal silver-medal';
            case 'gold': return 'fas fa-medal gold-medal';
            case 'platinum': return 'fas fa-award platinum-medal';
            case 'diamond': return 'fas fa-star diamond-medal';
            default: return 'fas fa-medal';
        }
    };

    const calculateTranslateX = () => {
        if (!carouselRef.current) return '0px';
        const activeCard = carouselRef.current.children[activeFeatureIndex];
        if (!activeCard) return '0px';
        const cardCenter = activeCard.offsetLeft + activeCard.offsetWidth / 2;
        const carouselCenter = carouselRef.current.offsetWidth / 2;
        return `translateX(${carouselCenter - cardCenter}px)`;
    };


    return (
        <div className="home-container">
            <section className="home-hero-section animated-section">
                <div className="home-content">


                    {isLoggedIn && !justSignedUp ?(
                        <h1 className="personalized-greeting">Welcome back, {userFirstName}! </h1>
                    ) : (
                        <h1>Welcome to Hands UP!</h1>
                    )}
                    <p className="home-tagline">Your journey to mastering sign language starts here. Connect, learn, and translate with ease.</p>
                    <div className="home-buttons">
                        <Link to="/translator" className="btn-primary">Start Translating</Link>
                        <Link to="/learn" className="btn-secondary">Begin Learning</Link>
                        <Link to="/game" className="btn-secondary">Sign Surfers</Link>
                    </div>
                </div>
                <div className="home-image">
                    <img src={homeImage} alt="Person signing" />
                </div>
            </section>

            {isLoggedIn && (
                <>
                    <hr className="divider" />
                    <section className="learning-overview-section animated-section">
                        <h2 className="section-title">Your Learning Journey</h2>
                        <div className="learning-overview-grid">
                            <div className="learning-progress-card">
                                <h3>Overall Progress</h3>
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${completionPercentage}%`, background: `linear-gradient(90deg, #FFD700, #FFA500)` }} 
                                    ></div>
                                </div>
                                <p className="progress-text">
                                    <span className="progress-highlight">{completionPercentage}%</span> Completed
                                </p>
                                <p className="progress-details">{calcLessonsCompleted + calcSignsLearned} of {TOTAL_LESSONS+TOTAL_SIGNS} lessons</p>
                                <Link to="/learn" className="btn-secondary small-btn">Continue Learning <i className="fas fa-arrow-right"></i></Link>
                            </div>
                            <div className="learning-stats-summary-card">
                                <h3>Your Learning Stats</h3>
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <i className="fas fa-book-reader stat-icon"></i>
                                        <span className="stat-value">{calcLessonsCompleted}</span>
                                        <span className="stat-label">Lessons Completed</span>
                                    </div>
                                    <div className="stat-item">
                                        <i className="fas fa-sign-language stat-icon" style={{ color: '#FFD700' }}></i>
                                        <span className="stat-value">{signsLearned}</span>
                                        <span className="stat-label">Signs Learned</span>
                                    </div>
                                    <div className="stat-item">
                                        <i className="fas fa-calendar-alt stat-icon"></i>
                                        <span className="stat-value">{practiseDays}</span>
                                        <span className="stat-label">Day Streak</span>
                                    </div>
                                    <div className="stat-item level-stat">
                                        <i className={getMedalClass(currentLevel)}></i>
                                        <span className="stat-value">{currentLevel}</span>
                                        <span className="stat-label">Level</span>
                                    </div>
                                </div>
                                <Link to="/learn" className="btn-secondary small-btn">View Full learning progress <i className="fas fa-user-circle"></i></Link>
                            </div>
                        </div>
                    </section>
                </>
            )}

            {signOfTheDay && (
                <>
                    <hr className="divider" />
                    <section className="sign-of-the-day-section animated-section">

                        <h2 className="section-title">Sign of the Day: &quot;{signOfTheDay.word}&quot; </h2>

                        <div className="sign-content">
                            <div className="sign-media">
                                <Canvas camera={{ position: [0, 0.2, 3], fov: 35 }}>
                                    {/* eslint-disable-next-line react/no-unknown-property */}
                                    <ambientLight intensity={5} />
                                    {/* eslint-disable-next-line react/no-unknown-property */}
                                    <group position={[0, -1.1, 0]}>
                                        <AngieSigns
                                            key={animationKey}
                                            landmarks={signOfTheDay.landmarks}
                                            
                                        />
                                    </group>
                                </Canvas>
                            </div>
                            <div className="sign-description">
                                <p>{signOfTheDay.description}</p>
                                <Link to="/learn" className="btn-secondary">Explore More Signs</Link>
                            </div>
                        </div>
                    </section>
                </>
            )}

            <hr className="divider" />

            <section className="features-section animated-section">
                <h2 className="section-title">Unlock Communication with Our Core Features</h2>
                <div className="feature-carousel-outer-wrapper">
                    <div
                        className="feature-carousel"
                        ref={carouselRef}
                        style={{ transform: calculateTranslateX() }}
                    >
                        {features.map((feature, index) => (
                            <Link
                                to={feature.link}
                                className={`feature-card ${index === activeFeatureIndex ? 'active-feature' : ''}`}
                                key={feature.id}
                            >
                                <i className={`${feature.iconClass} feature-icon`}></i>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="carousel-dots">
                    {features.map((_, index) => (
                        <span
                            key={index}
                            className={`dot ${index === activeFeatureIndex ? 'active' : ''}`}
                            onClick={() => setActiveFeatureIndex(index)}
                        ></span>
                    ))}
                </div>
            </section>

            <hr className="divider" />

            <section className="cta-section animated-section">
                <h2 className="section-title">Your Progress Inspires Us All! </h2>
                <p>Every sign you learn, every lesson you complete, builds a stronger, more inclusive world. Keep going, the journey of communication is truly rewarding.</p>
                <Link to="/learn" className="btn-final-cta">Keep Learning, Keep Growing</Link>
            </section>
        </div>
    );
};