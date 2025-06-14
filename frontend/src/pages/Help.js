import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  Book, 
  Video, 
  MessageCircle, 
  Phone, 
  FileText, 
  PlayCircle,
  Camera,
  User,
  Home,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  X
} from 'lucide-react';

const HelpMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <PlayCircle className="w-5 h-5" />,
      items: [
        'Creating your first account',
        'Understanding the interface',
        'Setting up your camera',
        'Your first sign translation'
      ]
    },
    {
      id: 'learning',
      title: 'Learning Mode',
      icon: <GraduationCap className="w-5 h-5" />,
      items: [
        'Accessing the curriculum',
        'Tracking your progress',
        'Understanding XP and streaks',
        'Lesson structure and feedback',
        'Practice exercises'
      ]
    },
    {
      id: 'translation',
      title: 'Video Translation',
      icon: <Camera className="w-5 h-5" />,
      items: [
        'Using camera input',
        'Uploading videos/images',
        'Real-time translation tips',
        'Improving accuracy',
        'Supported sign languages'
      ]
    },
    {
      id: 'profile',
      title: 'Profile & Settings',
      icon: <User className="w-5 h-5" />,
      items: [
        'Updating personal details',
        'Managing account settings',
        'Changing preferences',
        'Password reset',
        'Privacy settings'
      ]
    }
  ];

  const faqs = [
    {
      question: "How accurate is the sign language translation?",
      answer: "Our AI model achieves high accuracy for common signs and phrases. For best results, ensure good lighting and clear hand visibility."
    },
    {
      question: "Can I use the app offline?",
      answer: "Yes! As a PWA, you can access cached lessons and recent translations offline. Real-time translation requires an internet connection."
    },
    {
      question: "Which sign languages are supported?",
      answer: "We currently support American Sign Language (ASL) with plans to add more dialects. You can change your preferred dialect in settings."
    },
    {
      question: "How do I improve my signing accuracy?",
      answer: "Follow the feedback provided after each practice session, ensure good lighting, and keep your hands clearly visible to the camera."
    }
  ];

  const HelpButton = () => (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
      aria-label="Open help menu"
    >
      <HelpCircle className="w-6 h-6" />
    </button>
  );

  const HelpModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Hands UP Help Center</h2>
                <p className="text-blue-100">Get help with sign language learning</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-1/3 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search help topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 mb-6">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-white rounded-lg transition-colors">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Live Chat Support</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-white rounded-lg transition-colors">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Contact Support</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-white rounded-lg transition-colors">
                  <Video className="w-5 h-5 text-purple-600" />
                  <span className="font-medium">Video Tutorials</span>
                </button>
              </div>

              {/* Help Sections */}
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Help Topics</h3>
                {helpSections.map((section) => (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-white rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {section.icon}
                        <span className="font-medium">{section.title}</span>
                      </div>
                      {expandedSection === section.id ? 
                        <ChevronDown className="w-4 h-4" /> : 
                        <ChevronRight className="w-4 h-4" />
                      }
                    </button>
                    {expandedSection === section.id && (
                      <div className="ml-8 space-y-1">
                        {section.items.map((item, index) => (
                          <button
                            key={index}
                            className="block w-full text-left p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            {item}
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
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Welcome Section */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Hands UP!</h3>
                <p className="text-gray-600 mb-6">
                  Learn sign language with AI-powered translation and interactive lessons. 
                  Get started with our quick tutorials or browse help topics on the left.
                </p>
                
                {/* Quick Start Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <Home className="w-8 h-8 text-blue-600 mb-2" />
                    <h4 className="font-semibold text-blue-800">Home Dashboard</h4>
                    <p className="text-sm text-blue-600">View your progress and access all features</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <Book className="w-8 h-8 text-green-600 mb-2" />
                    <h4 className="font-semibold text-green-800">Learning Mode</h4>
                    <p className="text-sm text-green-600">Structured lessons with real-time feedback</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <Camera className="w-8 h-8 text-purple-600 mb-2" />
                    <h4 className="font-semibold text-purple-800">Video Translation</h4>
                    <p className="text-sm text-purple-600">Real-time sign language translation</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <User className="w-8 h-8 text-orange-600 mb-2" />
                    <h4 className="font-semibold text-orange-800">Profile Settings</h4>
                    <p className="text-sm text-orange-600">Manage your account and preferences</p>
                  </div>
                </div>
              </div>

              {/* FAQs Section */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{faq.question}</h4>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Still need help?</h3>
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>Start Live Chat</span>
                  </button>
                  <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    <span>Help Center</span>
                  </button>
                </div>
              </div>
            </div>
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