import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Search, 
  Video, 
  MessageCircle, 
  Phone, 
  PlayCircle,
  Camera,
  User,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Home,
  Book,
  X,
  Menu // Add Menu icon for hamburger toggle
} from 'lucide-react';
import '../styles/Help.css';

const HelpMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');
  const [expandedSection, setExpandedSection] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Check if we're in mobile/half-screen mode
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobile(isMobileView);
      // Reset sidebar visibility when switching to desktop
      if (!isMobileView) {
        setSidebarVisible(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const setActiveContent = (sectionId) => {
    setActiveSection(sectionId);
    // Hide sidebar after selecting content in mobile
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleBackdropClick = () => {
    setSidebarVisible(false);
  };

  const handleSectionItemClick = (itemId) => {
    const element = document.getElementById(itemId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Hide sidebar after navigation in mobile
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <PlayCircle className="help-icon" />,
      items: [
        { id: 'welcome', title: 'Welcome and Overview' },
        { id: 'create-account', title: 'Creating your first account' },
        { id: 'interface', title: 'Understanding the interface' },
        { id: 'setup-camera', title: 'Setting up your camera' },
        { id: 'first-translation', title: 'Your first translation' }
      ]
    },
    {
      id: 'learning',
      title: 'Learning Mode',
      icon: <GraduationCap className="help-icon" />,
      items: [
        { id: 'curriculum', title: 'Accessing the curriculum' },
        { id: 'progress', title: 'Tracking your progress' },
        { id: 'xp-streaks', title: 'Understanding XP and streaks' },
        { id: 'lesson-structure', title: 'Lesson structure and feedback' },
        { id: 'practice', title: 'Practice exercises' }
      ]
    },
    {
      id: 'translation',
      title: 'Video Translation',
      icon: <Camera className="help-icon" />,
      items: [
        { id: 'camera-input', title: 'Using camera input' },
        { id: 'upload-videos', title: 'Uploading videos/images' },
        { id: 'realtime-tips', title: 'Real-time translation tips' },
        { id: 'improve-accuracy', title: 'Improving accuracy' },
        { id: 'supported-languages', title: 'Supported sign languages' }
      ]
    },
    {
      id: 'profile',
      title: 'Profile & Settings',
      icon: <User className="help-icon" />,
      items: [
        { id: 'personal-details', title: 'Updating personal details' },
        { id: 'account-settings', title: 'Managing account settings' },
        { id: 'preferences', title: 'Changing preferences' },
        { id: 'password-reset', title: 'Password reset' },
        { id: 'privacy-settings', title: 'Privacy settings' }
      ]
    }
  ];

  const contentData = {
    'getting-started': {
      title: 'Getting Started',
      sections: [
        {
          id: 'welcome',
          title: 'Welcome and Overview',
          content: (
            <div>
              <h4>Welcome to Hands UP!</h4>
               {/* Quick Start Cards */}
                <div className="help-quick-start-grid">
                  <div className="help-quick-start-card blue">
                    <Home className="help-quick-start-icon" />
                    <h4 className="help-quick-start-title">Home Dashboard</h4>
                    <p className="help-quick-start-text">View your progress and access all features</p>
                  </div>
                  <div className="help-quick-start-card green">
                    <Book className="help-quick-start-icon" />
                    <h4 className="help-quick-start-title">Learning Mode</h4>
                    <p className="help-quick-start-text">Structured lessons with real-time feedback</p>
                  </div>
                  <div className="help-quick-start-card purple">
                    <Camera className="help-quick-start-icon" />
                    <h4 className="help-quick-start-title">Video Translation</h4>
                    <p className="help-quick-start-text">Real-time sign language translation</p>
                  </div>
                  <div className="help-quick-start-card orange">
                    <User className="help-quick-start-icon" />
                    <h4 className="help-quick-start-title">Profile Settings</h4>
                    <p className="help-quick-start-text">Manage your account and preferences</p>
                  </div>
                </div>
              <p>Hands UP is an AI-powered sign language learning platform that combines interactive lessons with real-time translation technology. Whether you&apos;re a complete beginner or looking to improve your signing skills, our app provides a comprehensive learning experience.</p>
              <h5>Key Features:</h5>
              <ul>
                <li><strong>Interactive Learning:</strong> Structured lessons with real-time feedback</li>
                <li><strong>AI Translation:</strong> Real-time sign language to text translation</li>
                <li><strong>Progress Tracking:</strong> Monitor your learning journey with XP and streaks</li>
                <li><strong>Flexible Learning:</strong> Learn at your own pace with offline capabilities</li>
              </ul>
            </div>
          )
        },
        {
          id: 'create-account',
          title: 'Creating Your First Account',
          content: (
            <div>
              <h4>Setting Up Your Account</h4>
              <p>Getting started with Hands UP is quick and easy:</p>
              <ol>
                <li><strong>Sign Up:</strong> Click the &quot;Sign Up&quot; button on the welcome screen</li>
                <li><strong>Enter Details:</strong> Provide your email, create a secure password</li>
                <li><strong>Verify Email:</strong> Check your inbox and click the verification link</li>
                <li><strong>Complete Profile:</strong> Add your name and learning preferences</li>
                <li><strong>Choose Goals:</strong> Select your learning objectives and preferred pace</li>
              </ol>
              <p><strong>Tip:</strong> Enable notifications to stay motivated with daily reminders!</p>
            </div>
          )
        },
        {
          id: 'interface',
          title: 'Understanding the Interface',
          content: (
            <div>
              <h4>Navigating Hands UP</h4>
              <p>The app interface is designed for intuitive navigation:</p>
              <h5>Main Navigation:</h5>
              <ul>
                <li><strong>Home:</strong> Dashboard with progress overview and quick access</li>
                <li><strong>Learn:</strong> Interactive lessons and curriculum</li>
                <li><strong>Translate:</strong> Real-time sign language translation</li>
                <li><strong>Profile:</strong> Account settings and personal progress</li>
              </ul>
              <h5>Dashboard Elements:</h5>
              <ul>
                <li><strong>Progress Ring:</strong> Shows your overall completion percentage</li>
                <li><strong>Streak Counter:</strong> Displays consecutive days of learning</li>
                <li><strong>XP Bar:</strong> Your experience points and level progress</li>
                <li><strong>Quick Actions:</strong> Fast access to common features</li>
              </ul>
            </div>
          )
        },
        {
          id: 'setup-camera',
          title: 'Setting Up Your Camera',
          content: (
            <div>
              <h4>Camera Setup for Best Results</h4>
              <p>Proper camera setup is crucial for accurate sign recognition:</p>
              <h5>Camera Permissions:</h5>
              <ol>
                <li>Allow camera access when prompted</li>
                <li>If blocked, go to browser settings and enable camera for Hands UP</li>
                <li>Test camera functionality in the translation section</li>
              </ol>
              <h5>Optimal Setup:</h5>
              <ul>
                <li><strong>Lighting:</strong> Ensure good, even lighting on your hands and face</li>
                <li><strong>Background:</strong> Use a plain, contrasting background</li>
                <li><strong>Position:</strong> Keep your hands clearly visible within the camera frame</li>
                <li><strong>Distance:</strong> Sit 2-3 feet away from the camera</li>
                <li><strong>Stability:</strong> Use a stable surface or phone stand</li>
              </ul>
            </div>
          )
        },
        {
          id: 'first-translation',
          title: 'Your First Translation',
          content: (
            <div>
              <h4>Making Your First Translation</h4>
              <p>Ready to try sign language translation? Follow these steps:</p>
              <h5>Step-by-Step Guide:</h5>
              <ol>
                <li><strong>Navigate:</strong> Go to the &quot;Translate&quot; section</li>
                <li><strong>Camera Check:</strong> Ensure your camera is working and properly positioned</li>
                <li><strong>Start Simple:</strong> Begin with basic signs like &quot;Hello&quot; or &quot;Thank you&quot;</li>
                <li><strong>Sign Clearly:</strong> Make deliberate, clear movements</li>
                <li><strong>Read Results:</strong> The translation will appear in real-time</li>
                <li><strong>Practice:</strong> Try different signs and phrases</li>
              </ol>
              <h5>Tips for Success:</h5>
              <ul>
                <li>Start with fingerspelling (A-Z) to test accuracy</li>
                <li>Use proper ASL handshapes and movements</li>
                <li>Take your time - accuracy improves with practice</li>
                <li>Check the supported signs list for reference</li>
              </ul>
            </div>
          )
        }
      ]
    },
    'learning': {
      title: 'Learning Mode',
      sections: [
        {
          id: 'curriculum',
          title: 'Accessing the Curriculum',
          content: (
            <div>
              <h4>Exploring the Learning Curriculum</h4>
              <p>Our structured curriculum takes you from beginner to advanced signing:</p>
              <h5>Curriculum Structure:</h5>
              <ul>
                <li><strong>Beginner:</strong> Basic handshapes, fingerspelling, common words</li>
                <li><strong>Intermediate:</strong> Phrases, grammar, conversational signs</li>
                <li><strong>Advanced:</strong> Complex sentences, idioms, regional variations</li>
              </ul>
              <p>Each lesson builds on previous knowledge, ensuring steady progress.</p>
            </div>
          )
        },
        {
          id: 'progress',
          title: 'Tracking Your Progress',
          content: (
            <div>
              <h4>Monitor Your Learning Journey</h4>
              <p>Keep track of your advancement with our comprehensive progress system:</p>
              <ul>
                <li><strong>Completion Percentage:</strong> Overall course progress</li>
                <li><strong>Lesson Stats:</strong> Individual lesson scores and times</li>
                <li><strong>Skill Levels:</strong> Proficiency in different sign categories</li>
                <li><strong>Learning Streaks:</strong> Consecutive days of practice</li>
              </ul>
            </div>
          )
        }
      ]
    },
    'translation': {
      title: 'Video Translation',
      sections: [
        {
          id: 'camera-input',
          title: 'Using Camera Input',
          content: (
            <div>
              <h4>Camera-Based Translation</h4>
              <p>Learn how to use your camera effectively for real-time translation:</p>
              <ul>
                <li><strong>Live Feed:</strong> Real-time sign recognition</li>
                <li><strong>Recording:</strong> Save and replay your signing sessions</li>
                <li><strong>Frame Rate:</strong> Optimal camera settings for accuracy</li>
              </ul>
            </div>
          )
        }
      ]
    },
    'profile': {
      title: 'Profile & Settings',
      sections: [
        {
          id: 'personal-details',
          title: 'Updating Personal Details',
          content: (
            <div>
              <h4>Managing Your Profile</h4>
              <p>Keep your account information up to date:</p>
              <ul>
                <li><strong>Name & Email:</strong> Update contact information</li>
                <li><strong>Learning Goals:</strong> Adjust your objectives</li>
                <li><strong>Preferences:</strong> Customize your experience</li>
              </ul>
            </div>
          )
        }
      ]
    }
  };

  const HelpButton = () => (
    <button
      onClick={() => setIsOpen(true)}
      className="help-button"
      aria-label="Open help menu"
    >
      <HelpCircle className="help-button-icon" />
    </button>
  );

  const renderMainContent = () => {
    const currentContent = contentData[activeSection];
    if (!currentContent) return null;

    return (
      <div className="help-content-inner">
        <div className="help-content-header">
          <h2 className="help-content-title">{currentContent.title}</h2>
        </div>
        
        <div className="help-content-sections">
          {currentContent.sections.map((section) => (
            <div key={section.id} className="help-content-section" id={section.id}>
              <h3 className="help-section-heading">{section.title}</h3>
              <div className="help-section-content">
                {section.content}
              </div>
            </div>
          ))}
        </div>

        <div className="help-support">
          <h3 className="help-support-title">Need More Help?</h3>
          <div className="help-support-buttons">
            <button className="help-support-button green">
              <MessageCircle className="help-support-icon" />
              <span>Live Chat Support</span>
            </button>
            <button className="help-support-button blue">
              <Phone className="help-support-icon" />
              <span>Contact Support</span>
            </button>
            <button className="help-support-button purple">
              <Video className="help-support-icon" />
              <span>Video Tutorials</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const HelpModal = () => (
    <div className="help-modal-overlay">
      <div className="help-modal">
        {/* Header */}
        <div className="help-modal-header">
          {/* Mobile Sidebar Toggle Button */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="help-sidebar-toggle"
              aria-label="Toggle navigation menu"
            >
              <Menu className="help-sidebar-toggle-icon" />
            </button>
          )}
          
          <div className="help-modal-header-content">
            <div className="help-modal-header-left">
              <div className="help-modal-header-icon">
                <HelpCircle className="help-modal-icon" />
              </div>
              <div className="help-modal-header-text">
                <h2 className="help-modal-title">Hands UP Help Center</h2>
                <p className="help-modal-subtitle">Get help with sign language learning</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="help-modal-close"
            >
              <X className="help-modal-close-icon" />
            </button>
          </div>
        </div>

        <div className="help-modal-body">
          {/* Mobile Sidebar Backdrop */}
          {isMobile && sidebarVisible && (
            <div 
              className={`help-sidebar-backdrop ${sidebarVisible ? 'active' : ''}`}
              onClick={handleBackdropClick}
            />
          )}

          {/* Sidebar */}
          <div className={`help-sidebar ${isMobile && sidebarVisible ? 'active' : ''}`}>
            <div className="help-sidebar-content">
              {/* Search Bar */}
              <div className="help-search-container">
                <Search className="help-search-icon" />
                <input
                  type="text"
                  placeholder="Search help topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="help-search-input"
                />
              </div>

              {/* Help Sections Navigation */}
              <div className="help-sections">
                <h3 className="help-sections-title">Help Topics</h3>
                {helpSections.map((section) => (
                  <div key={section.id} className="help-section">
                    <button
                      onClick={() => {
                        setActiveContent(section.id);
                        toggleSection(section.id);
                      }}
                      className={`help-section-button ${activeSection === section.id ? 'active' : ''}`}
                    >
                      <div className="help-section-left">
                        {section.icon}
                        <span className="help-section-title">{section.title}</span>
                      </div>
                      {expandedSection === section.id ? 
                        <ChevronDown className="help-chevron" /> : 
                        <ChevronRight className="help-chevron" />
                      }
                    </button>
                    {expandedSection === section.id && (
                      <div className="help-section-items">
                        {section.items.map((item, index) => (
                          <button
                            key={index}
                            className="help-section-item"
                            onClick={() => handleSectionItemClick(item.id)}
                          >
                            {item.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="help-main-content">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <HelpButton />
      {isOpen && <HelpModal />}
    </div>
  );
};

export default HelpMenu;