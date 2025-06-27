import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/authContext.js';
import { useLearningStats } from '../contexts/learningStatsContext';
import '../styles/home.css';
import homeImage from '../images/picture1.png';
import learnVideo from '../videos/chocolate.mp4';
import chocolateVideo from '../videos/learn.mp4';

const signsOfTheDayData = [
    { id: 'sotd1', word: "Learn", gif: learnVideo,
      description: "The sign for 'learn' typically involves moving your dominant hand, palm up and fingers spread, from an open flat hand on your non-dominant palm, closing into a grasping shape as you bring it up to your forehead, as if picking up knowledge."
  },
  {
    id: 'sotd2',
    word: "Chocolate",
    gif: chocolateVideo, description: "To sign 'chocolate', form your dominant hand into a 'C' shape. Bring it to your non-dominant hand, which is held flat and stationary, and twist your 'C' hand on the back of your non-dominant hand."}
];

const features = [
    { id: 'translator', iconClass: 'fas fa-hand-paper', title: 'Translator', description: 'Instantly translate sign language into words or phrases with cutting-edge recognition.', link: '/translator' },
    { id: 'learn', iconClass: 'fas fa-book-open', title: 'Learn & Practice', description: 'Dive into interactive lessons, engaging quizzes, and practical exercises designed for all levels.', link: '/learn' },
    { id: 'profile', iconClass: 'fas fa-user-circle', title: 'Your Personalized Profile', description: 'Track your learning progress, manage your achievements, and customize your experience.', link: '/userProfile' },
];

export function Home(){
    const { currentUser, isLoggedIn } = useAuth();
    const { stats } = useLearningStats() || {};

    const [signOfTheDay, setSignOfTheDay] = useState(null);
    const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
    const carouselRef = useRef(null);

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


    const lessonProgress = (calcLessonsCompleted +calcSignsLearned)/ (TOTAL_LESSONS+TOTAL_SIGNS) * 100;

    
    const completionPercentage = Math.min(100, Math.round(
     lessonProgress));

    
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * signsOfTheDayData.length);
        setSignOfTheDay(signsOfTheDayData[randomIndex]);

        const featureInterval = setInterval(() => {
            setActiveFeatureIndex(prevIndex => (prevIndex + 1) % features.length);
        }, 5000);

        return () => clearInterval(featureInterval);
    }, []);

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
                    {isLoggedIn ? (
                        <h1 className="personalized-greeting">Welcome back, {userFirstName}! 👋</h1>
                    ) : (
                        <h1>Welcome to Hands UP!</h1>
                    )}
                    <p className="home-tagline">Your journey to mastering sign language starts here. Connect, learn, and translate with ease.</p>
                    <div className="home-buttons">
                        <Link to="/translator" className="btn-primary">Start Translating</Link>
                        <Link to="/learn" className="btn-secondary">Begin Learning</Link>
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
                        <h2 className="section-title">Your Learning Journey 🚀</h2>

                        <div className="learning-overview-grid">
                            <div className="learning-progress-card">
                                <h3>Overall Progress</h3>
                                <div className="progress-bar-container">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${completionPercentage}%`, background: `linear-gradient(90deg, #FFD700, #FFA500)` }} /* Added yellow gradient */
                                    ></div>
                                </div>
                                <p className="progress-text">
                                    <span className="progress-highlight">{completionPercentage}%</span> Completed
                                </p>
                                <p className="progress-details">{calcLessonsCompleted + calcSignsLearned}  of {TOTAL_LESSONS+TOTAL_SIGNS} lessons</p>
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
                                        <i className="fas fa-sign-language stat-icon" style={{ color: '#FFD700' }}></i> {/* Yellow for signs learned */}
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
                        <h2 className="section-title">Sign of the Day: &quot;{signOfTheDay.word}&quot; ✨</h2>
                        <div className="sign-content">
                               <div className="sign-media">
                            <video
                                src={signOfTheDay.gif}
                                alt={signOfTheDay.word}
                                controls
                                autoPlay
                                loop
                                muted
                                className="sign-video"
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                            <div className="sign-description">
                                <p>{signOfTheDay.description}</p>
                                <Link to="/learnVideo" className="btn-secondary">Explore More Signs</Link>
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
                <h2 className="section-title">Your Progress Inspires Us All! ✨</h2>
                <p>Every sign you learn, every lesson you complete, builds a stronger, more inclusive world. Keep going, the journey of communication is truly rewarding.</p>
                <Link to="/learn" className="btn-final-cta">Keep Learning, Keep Growing</Link>
            </section>
        </div>
    );
};
