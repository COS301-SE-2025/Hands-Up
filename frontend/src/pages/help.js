import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Video, 
  MessageCircle, 
  Phone, 
  Camera,
  User,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Home,
  Book,
  X,
  Menu
} from 'lucide-react';
import '../styles/help.css';

export function HelpMenu(){
  const [isOpen, setIsOpen] = useState(false);
  //const [searchQuery, setSearchQuery] = useState('');
  //const [searchResults, setSearchResults] = useState([]);
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
    // Clear search when switching sections
    //setSearchQuery('');
    //setSearchResults([]);
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

  // FAQ section data
  const faqData = {
    title: 'Frequently Asked Questions',
    sections: [
      {
        id: 'faq-general',
        title: 'General Questions',
        content: (
          <div className="faq-container">
            <div className="faq-item">
              <h5>How do I get started with Hands UP?</h5>
              <p>Simply create an account, set up your camera, and begin with our Getting Started guide. The app will walk you through your first translation and lesson.</p>
            </div>
            <div className="faq-item">
              <h5>Is Hands UP free to use?</h5>
              <p>Yes, Hands UP offers a comprehensive free tier with access to basic lessons and translation features. Premium features are available with a subscription.</p>
            </div>
            <div className="faq-item">
              <h5>What sign languages are supported?</h5>
              <p>Currently, we support American Sign Language (ASL) with plans to add more sign languages in future updates.</p>
            </div>
            <div className="faq-item">
              <h5>Do I need special equipment to use the app?</h5>
              <p>You only need a device with a camera (smartphone, tablet, or computer with webcam). No special equipment is required.</p>
            </div>
            <div className="faq-item">
              <h5>How accurate is the sign language translation?</h5>
              <p>Our AI translation accuracy continues to improve with regular updates. Accuracy is best with clear lighting and proper camera positioning.</p>
            </div>
            <div className="faq-item">
              <h5>Can I use the app offline?</h5>
              <p>Some lessons can be accessed offline once downloaded, but real-time translation requires an internet connection.</p>
            </div>
            <div className="faq-item">
              <h5>How do I reset my password?</h5>
              <p>Go to your Profile settings and select &quot;Password Reset&quot; or use the forgot password link on the login page.</p>
            </div>
            <div className="faq-item">
              <h5>Why isn&apos;t my camera working?</h5>
              <p>Ensure you&apos;ve granted camera permissions to the app in your browser settings. Check our Camera Setup guide for detailed troubleshooting.</p>
            </div>
            <div className="faq-item">
              <h5>How do streaks and XP work?</h5>
              <p>You earn XP by completing lessons and using translation features. Streaks track consecutive days of app usage to encourage regular practice.</p>
            </div>
            <div className="faq-item">
              <h5>Can I delete my account and data?</h5>
              <p>Yes, you can permanently delete your account and all associated data from the Profile settings page.</p>
            </div>
          </div>
        )
      }
    ]
  };

  // Content data
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
                    <p className="help-quick-start-text">Manage your account </p>
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
          title: 'Updating Account',
          content: (
            <div>
              <h4>Setting Up Your Account</h4>
              <p>Updating your account is quick and easy:</p>
              <ol>
                <li><strong>Access Profile Page:</strong> Click the &quot;Profile icon ( by default it should be the Initials of your firstName and lastName ) &quot; button on the nav bar</li>
                <li><strong>Edit Details:</strong> Here you can edit any of your details including First Name , Last Name, UserName, Email, New Password, add profile picture. Remember to press the Save Changes button once done.  </li>
                <li><strong>View Terms and Conditions:</strong> Here you can view all our terms and conditions and see if you are pleased with them.</li>
                <li><strong>Logout:</strong> Here you can logout of the app and it automatically logs out once the button is pressed</li>
                <li><strong>Delete Account:</strong> This allows you to delete your account. This is a permenant change and removes this from your account from the database. After pressing proceed, the will be a confirmation procedure where you will need to type DELETE to confirm this. </li>
              </ol>
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
                <li><strong>Progress Bar:</strong> Shows your overall completion percentage</li>
                <li><strong>Lessons Completed:</strong> Displays the number of different lessons completed</li>
                <li><strong>Signs Learned:</strong> Displays the number of SIGNS learned</li>
                <li><strong>Streak Counter:</strong> Displays consecutive days of learning</li>
                <li><strong>Level:</strong> Your overall progress made will affect the level you are ie Beginner Bronze, Intermediate Silver, Advanced Gold</li>
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
                <li><strong>Capture Sign:</strong> Allows you to take a picture </li>
                <li><strong>Record Sequence:</strong> This will start real time translation</li>
                <li><strong>Upload Sign:</strong> This will ask you to find a picture/video to upload from your pc that needs to be translated</li>
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
    },
    'faq': faqData
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

  // Local search function - only searches within the current active section
  // const performLocalSearch = (query) => {
  //   if (!query || query.trim() === "") {
  //     //setSearchResults([]);
  //     return;
  //   }

  //   const results = [];
  //   const currentContent = contentData[activeSection];
    
  //   if (currentContent) {
  //     currentContent.sections.forEach((section) => {
  //       // Search in title
  //       const titleMatch = section.title.toLowerCase().includes(query.toLowerCase());
        
  //       // Extract text content for searching
  //       let contentText = "";
  //       if (typeof section.content === "string") {
  //         contentText = section.content;
  //       } else if (React.isValidElement(section.content)) {
  //         // Simple text extraction from React elements
  //         const extractText = (element) => {
  //           if (typeof element === "string") return element;
  //           if (Array.isArray(element)) return element.map(extractText).join(" ");
  //           if (React.isValidElement(element)) {
  //             return extractText(element.props.children);
  //           }
  //           return "";
  //         };
  //         contentText = extractText(section.content);
  //       }
        
  //       const contentMatch = contentText.toLowerCase().includes(query.toLowerCase());
        
  //       if (titleMatch || contentMatch) {
  //         results.push({
  //           id: section.id,
  //           title: section.title,
  //           snippet: contentText.substring(0, 100) + "..." // Show a snippet
  //         });
  //       }
  //     });
  //   }
    
  //   setSearchResults(results);
  // };

  const renderMainContent = () => {
    const currentContent = contentData[activeSection];
    if (!currentContent) return null;

    return (
      <div className="help-content-inner">
        <div className="help-content-header">
          <h2 className="help-content-title">{currentContent.title}</h2>
          {/* Local search bar */}
          {/* <div className="help-search-container help-search-main">
            <Search className="help-search-icon" />
            <input
              type="text"
              placeholder={`Search in ${currentContent.title}...`}
              value={searchQuery}
              onChange={(e) => {
                //setSearchQuery(e.target.value);
                //performLocalSearch(e.target.value);
              }}
              className="help-search-input"
            />
            {searchResults.length > 0 && (
              <div className="help-search-results">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="help-search-result-item"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setTimeout(() => {
                        const el = document.getElementById(result.id);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                  >
                    <span className="help-search-result-title">{result.title}</span>
                    <span className="help-search-result-snippet">{result.snippet}</span>
                  </div>
                ))}
              </div>
            )}
          </div> */}
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

        {/* Support section */}
        <div className="help-support">
          <div className="help-contact-section">
            <h3 className="help-support-title">Need More Help?</h3>
            <div className="help-contact-info">
              <div className="help-contact-item">
                <MessageCircle className="help-contact-icon" />
                <div className="help-contact-details">
                  <span className="help-contact-label">Email Support</span>
                  <span className="help-contact-value">support@handsup.com</span>
                </div>
              </div>
              <div className="help-contact-item">
                <Phone className="help-contact-icon" />
                <div className="help-contact-details">
                  <span className="help-contact-label">Phone Support</span>
                  <span className="help-contact-value">+1 (555) 123-4567</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="help-video-section">
            <h3 className="help-video-title">Video Tutorial</h3>
            <div className="help-video-container">
              <div className="help-video-placeholder">
                <Video className="help-video-icon" />
                <span className="help-video-text">Complete App Tutorial</span>
                <p className="help-video-description">Watch our comprehensive guide on how to use all features of Hands UP</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Define helpSections for sidebar navigation
  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Home className="help-section-icon" />,
      items: contentData['getting-started'].sections.map(section => ({
        id: section.id,
        title: section.title
      }))
    },
    {
      id: 'learning',
      title: 'Learning Mode',
      icon: <GraduationCap className="help-section-icon" />,
      items: contentData['learning'].sections.map(section => ({
        id: section.id,
        title: section.title
      }))
    },
    {
      id: 'translation',
      title: 'Video Translation',
      icon: <Camera className="help-section-icon" />,
      items: contentData['translation'].sections.map(section => ({
        id: section.id,
        title: section.title
      }))
    },
    {
      id: 'profile',
      title: 'Profile & Settings',
      icon: <User className="help-section-icon" />,
      items: contentData['profile'].sections.map(section => ({
        id: section.id,
        title: section.title
      }))
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: <HelpCircle className="help-section-icon" />,
      items: contentData['faq'].sections.map(section => ({
        id: section.id,
        title: section.title
      }))
    }
  ];

  const HelpModal = () => (
    <div className="help-modal-overlay">
      <div className="help-modal">
        {/* Header */}
        <div className="help-modal-header">
          {/* Mobile Sidebar Toggle Button */}
          {isMobile && (
            <button
              type="button"
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
              type="button"
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
              <div className="help-sections">
                <h3 className="help-sections-title">Help Topics</h3>
                {helpSections.map((section) => (
                  <div key={section.id} className="help-section">
                    <button
                    type="button"
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
                          type="button"
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