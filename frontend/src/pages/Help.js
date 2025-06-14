import React, { useState } from 'react';

const faqs = [
  {
    question: "How do I use the Translator?",
    answer: "Go to the Translator page and use your webcam or upload an image to translate sign language into text."
  },
  {
    question: "How can I track my learning progress?",
    answer: "Visit your Profile page to see your stats, achievements, and progress history."
  },
  {
    question: "Who can I contact for support?",
    answer: "Scroll to the bottom of this page for support contact details."
  }
];

const HelpPage = () => {
  const [search, setSearch] = useState('');
  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(search.toLowerCase()) ||
    faq.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#234d20',
      width: '100%',
      maxWidth: '900px',
      margin: '2.5rem auto 2rem auto',
      padding: '2rem 1.5rem 1.5rem 1.5rem',
      background: 'linear-gradient(135deg, #eafbe6 0%, #f6fff2 100%)',
      borderRadius: '2rem',
      boxShadow: '0 8px 32px rgba(46, 125, 50, 0.10)',
      display: 'flex',
      flexDirection: 'column',
      gap: '2.5rem'
    }}>
      <section style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '2.5rem',
        padding: '2rem 0 1rem 0',
        background: 'none',
        color: '#234d20',
        borderRadius: '1.5rem',
        textAlign: 'left',
        boxShadow: 'none'
      }} aria-labelledby="help-main-title">
        <div style={{ flex: 2 }}>
          <h1 id="help-main-title" style={{
            fontSize: '2.7rem',
            marginBottom: '0.7rem',
            fontWeight: '700',
            color: '#234d20',
            letterSpacing: '-1px'
          }}>Hands UP Help Center</h1>
          <p style={{
            fontSize: '1.15rem',
            marginBottom: '1.5rem',
            color: '#4e7a51',
            opacity: '0.85'
          }}>
            Your journey to mastering sign language starts here. Connect, learn, and translate with ease.
          </p>
          <div style={{ display: 'flex', gap: '1.2rem' }}>
            <a href="/translator" style={{
              padding: '0.7rem 1.7rem',
              borderRadius: '2rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
              boxShadow: '0 2px 8px rgba(167, 209, 41, 0.08)',
              textDecoration: 'none',
              outline: 'none',
              background: 'linear-gradient(90deg, #a7d129 60%, #4e7a51 100%)',
              color: '#fff'
            }} aria-label="Start Translating">Start Translating</a>
            <a href="/learn" style={{
              padding: '0.7rem 1.7rem',
              borderRadius: '2rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              border: '2px solid #a7d129',
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
              boxShadow: '0 2px 8px rgba(167, 209, 41, 0.08)',
              textDecoration: 'none',
              outline: 'none',
              background: '#fff',
              color: '#4e7a51'
            }} aria-label="Begin Learning">Begin Learning</a>
          </div>
        </div>
      </section>

      <hr style={{
        border: 'none',
        borderTop: '2px dashed #a7d12944',
        margin: '0.5rem 0 1.5rem 0'
      }} />

      {/* Getting Better Results Section */}
      <section style={{
        padding: '1.5rem 0.5rem 2rem 0.5rem',
        background: 'linear-gradient(90deg, #eafbe6 60%, #f6fff2 100%)',
        borderRadius: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 12px rgba(46, 125, 50, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          marginBottom: '1.2rem'
        }}>
          <i className="fas fa-target" style={{
            fontSize: '1.8rem',
            color: '#a7d129'
          }}></i>
          <h2 style={{
            fontSize: '1.7rem',
            margin: '0',
            color: '#4e7a51',
            fontWeight: '600'
          }}>Getting Better Translation Results</h2>
        </div>
        <p style={{
          fontSize: '1rem',
          color: '#234d20',
          opacity: '0.85',
          marginBottom: '1.5rem'
        }}>Improve your translation accuracy with these essential tips for optimal camera setup and signing technique.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: '#fff',
            borderRadius: '1rem',
            boxShadow: '0 1px 6px rgba(167, 209, 41, 0.07)',
            padding: '1.1rem 1.2rem',
            borderLeft: '5px solid #a7d129',
            transition: 'box-shadow 0.2s'
          }}>
            <strong style={{
              display: 'block',
              fontSize: '1.08rem',
              color: '#4e7a51',
              marginBottom: '0.3rem',
              fontWeight: '600'
            }}>Lighting & Environment</strong>
            <p style={{
              margin: '0',
              color: '#234d20',
              fontSize: '1rem',
              opacity: '0.92'
            }}>Use bright, even lighting and avoid shadows on your hands. Position yourself against a plain background.</p>
          </div>
          
          <div style={{
            background: '#fff',
            borderRadius: '1rem',
            boxShadow: '0 1px 6px rgba(167, 209, 41, 0.07)',
            padding: '1.1rem 1.2rem',
            borderLeft: '5px solid #a7d129',
            transition: 'box-shadow 0.2s'
          }}>
            <strong style={{
              display: 'block',
              fontSize: '1.08rem',
              color: '#4e7a51',
              marginBottom: '0.3rem',
              fontWeight: '600'
            }}>Hand Positioning</strong>
            <p style={{
              margin: '0',
              color: '#234d20',
              fontSize: '1rem',
              opacity: '0.92'
            }}>Keep your hands clearly visible within the camera frame. Sign at a moderate pace for best recognition.</p>
          </div>
        </div>
      </section>

      <hr style={{
        border: 'none',
        borderTop: '2px dashed #a7d12944',
        margin: '0.5rem 0 1.5rem 0'
      }} />

      {/* Effective Learning Section */}
      <section style={{
        padding: '1.5rem 0.5rem 2rem 0.5rem',
        background: 'linear-gradient(90deg, #eafbe6 60%, #f6fff2 100%)',
        borderRadius: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 12px rgba(46, 125, 50, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          marginBottom: '1.2rem'
        }}>
          <i className="fas fa-brain" style={{
            fontSize: '1.8rem',
            color: '#a7d129'
          }}></i>
          <h2 style={{
            fontSize: '1.7rem',
            margin: '0',
            color: '#4e7a51',
            fontWeight: '600'
          }}>Learning More Effectively</h2>
        </div>
        <p style={{
          fontSize: '1rem',
          color: '#234d20',
          opacity: '0.85',
          marginBottom: '1.5rem'
        }}>Maximize your learning potential with proven study techniques and practice strategies.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: '#fff',
            borderRadius: '1rem',
            boxShadow: '0 1px 6px rgba(167, 209, 41, 0.07)',
            padding: '1.1rem 1.2rem',
            borderLeft: '5px solid #a7d129',
            transition: 'box-shadow 0.2s'
          }}>
            <strong style={{
              display: 'block',
              fontSize: '1.08rem',
              color: '#4e7a51',
              marginBottom: '0.3rem',
              fontWeight: '600'
            }}>Daily Practice</strong>
            <p style={{
              margin: '0',
              color: '#234d20',
              fontSize: '1rem',
              opacity: '0.92'
            }}>Consistency beats intensity. Practice 15-20 minutes daily rather than long irregular sessions.</p>
          </div>
          
          <div style={{
            background: '#fff',
            borderRadius: '1rem',
            boxShadow: '0 1px 6px rgba(167, 209, 41, 0.07)',
            padding: '1.1rem 1.2rem',
            borderLeft: '5px solid #a7d129',
            transition: 'box-shadow 0.2s'
          }}>
            <strong style={{
              display: 'block',
              fontSize: '1.08rem',
              color: '#4e7a51',
              marginBottom: '0.3rem',
              fontWeight: '600'
            }}>Progressive Learning</strong>
            <p style={{
              margin: '0',
              color: '#234d20',
              fontSize: '1rem',
              opacity: '0.92'
            }}>Master basics first. Learn the alphabet and numbers before moving to complex phrases and sentences.</p>
          </div>
        </div>
      </section>

      <hr style={{
        border: 'none',
        borderTop: '2px dashed #a7d12944',
        margin: '0.5rem 0 1.5rem 0'
      }} />

      {/* Common Mistakes Section */}
      <section style={{
        padding: '1.5rem 0.5rem 2rem 0.5rem',
        background: 'linear-gradient(90deg, #eafbe6 60%, #f6fff2 100%)',
        borderRadius: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 12px rgba(46, 125, 50, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          marginBottom: '1.2rem'
        }}>
          <i className="fas fa-exclamation-triangle" style={{
            fontSize: '1.8rem',
            color: '#a7d129'
          }}></i>
          <h2 style={{
            fontSize: '1.7rem',
            margin: '0',
            color: '#4e7a51',
            fontWeight: '600'
          }}>Common Mistakes to Avoid</h2>
        </div>
        <p style={{
          fontSize: '1rem',
          color: '#234d20',
          opacity: '0.85',
          marginBottom: '1.5rem'
        }}>Learn from others experiences and avoid these frequent pitfalls in sign language learning.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: '#fff',
            borderRadius: '1rem',
            boxShadow: '0 1px 6px rgba(167, 209, 41, 0.07)',
            padding: '1.1rem 1.2rem',
            borderLeft: '5px solid #a7d129',
            transition: 'box-shadow 0.2s'
          }}>
            <strong style={{
              display: 'block',
              fontSize: '1.08rem',
              color: '#4e7a51',
              marginBottom: '0.3rem',
              fontWeight: '600'
            }}>Finger Spelling Rush</strong>
            <p style={{
              margin: '0',
              color: '#234d20',
              fontSize: '1rem',
              opacity: '0.92'
            }}>Do not rush through finger spelling. Take time to form each letter clearly and distinctly.</p>
          </div>
          
          <div style={{
            background: '#fff',
            borderRadius: '1rem',
            boxShadow: '0 1px 6px rgba(167, 209, 41, 0.07)',
            padding: '1.1rem 1.2rem',
            borderLeft: '5px solid #a7d129',
            transition: 'box-shadow 0.2s'
          }}>
            <strong style={{
              display: 'block',
              fontSize: '1.08rem',
              color: '#4e7a51',
              marginBottom: '0.3rem',
              fontWeight: '600'
            }}>Facial Expression</strong>
            <p style={{
              margin: '0',
              color: '#234d20',
              fontSize: '1rem',
              opacity: '0.92'
            }}>Remember that facial expressions are crucial in sign language. Do not focus only on hand movements.</p>
          </div>
        </div>
      </section>

      <hr style={{
        border: 'none',
        borderTop: '2px dashed #a7d12944',
        margin: '0.5rem 0 1.5rem 0'
      }} />

      {/* Progress Tracking Section */}
      <section style={{
        padding: '1.5rem 0.5rem 2rem 0.5rem',
        background: 'linear-gradient(90deg, #eafbe6 60%, #f6fff2 100%)',
        borderRadius: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 12px rgba(46, 125, 50, 0.04)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          marginBottom: '1.2rem'
        }}>
          <i className="fas fa-chart-line" style={{
            fontSize: '1.8rem',
            color: '#a7d129'
          }}></i>
          <h2 style={{
            fontSize: '1.7rem',
            margin: '0',
            color: '#4e7a51',
            fontWeight: '600'
          }}>Tracking Your Progress</h2>
        </div>
        <p style={{
          fontSize: '1rem',
          color: '#234d20',
          opacity: '0.85',
          marginBottom: '1.5rem'
        }}>Stay motivated and measure your improvement with smart tracking and goal-setting strategies.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: '#fff',
            borderRadius: '1rem',
            boxShadow: '0 1px 6px rgba(167, 209, 41, 0.07)',
            padding: '1.1rem 1.2rem',
            borderLeft: '5px solid #a7d129',
            transition: 'box-shadow 0.2s'
          }}>
            <strong style={{
              display: 'block',
              fontSize: '1.08rem',
              color: '#4e7a51',
              marginBottom: '0.3rem',
              fontWeight: '600'
            }}>Set Realistic Goals</strong>
            <p style={{
              margin: '0',
              color: '#234d20',
              fontSize: '1rem',
              opacity: '0.92'
            }}>Break down your learning into achievable milestones. Celebrate small wins along your journey.</p>
          </div>
          
          <div style={{
            background: '#fff',
            borderRadius: '1rem',
            boxShadow: '0 1px 6px rgba(167, 209, 41, 0.07)',
            padding: '1.1rem 1.2rem',
            borderLeft: '5px solid #a7d129',
            transition: 'box-shadow 0.2s'
          }}>
            <strong style={{
              display: 'block',
              fontSize: '1.08rem',
              color: '#4e7a51',
              marginBottom: '0.3rem',
              fontWeight: '600'
            }}>Regular Assessment</strong>
            <p style={{
              margin: '0',
              color: '#234d20',
              fontSize: '1rem',
              opacity: '0.92'
            }}>Use our built-in progress tracker to identify strengths and areas that need more practice.</p>
          </div>
        </div>
      </section>

      <hr style={{
        border: 'none',
        borderTop: '2px dashed #a7d12944',
        margin: '0.5rem 0 1.5rem 0'
      }} />

      <section style={{
        padding: '1.5rem 0.5rem 2rem 0.5rem',
        background: 'linear-gradient(90deg, #eafbe6 60%, #f6fff2 100%)',
        borderRadius: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 12px rgba(46, 125, 50, 0.04)'
      }} aria-label="Frequently Asked Questions">
        <h2 style={{
          fontSize: '1.7rem',
          marginBottom: '1.2rem',
          color: '#4e7a51',
          fontWeight: '600'
        }}>Frequently Asked Questions</h2>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <input
            type="text"
            style={{
              width: '100%',
              maxWidth: '350px',
              padding: '0.8rem 1.2rem',
              border: '2px solid #a7d129',
              borderRadius: '2rem',
              fontSize: '1.05rem',
              background: '#f6fff2',
              color: '#234d20',
              outline: 'none',
              transition: 'border 0.2s'
            }}
            placeholder="Search help topics or FAQs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search help topics"
            onFocus={(e) => e.target.style.borderColor = '#4e7a51'}
            onBlur={(e) => e.target.style.borderColor = '#a7d129'}
          />
        </div>
        
        <ul style={{
          listStyle: 'none',
          padding: '0',
          margin: '0'
        }}>
          {filteredFaqs.length === 0 && <li>No results found.</li>}
          {filteredFaqs.map((faq, idx) => (
            <li key={idx} style={{
              marginBottom: '1.2rem',
              background: '#fff',
              borderRadius: '1rem',
              boxShadow: '0 1px 6px rgba(167, 209, 41, 0.07)',
              padding: '1.1rem 1.2rem',
              borderLeft: '5px solid #a7d129',
              transition: 'box-shadow 0.2s'
            }}>
              <strong style={{
                display: 'block',
                fontSize: '1.08rem',
                color: '#4e7a51',
                marginBottom: '0.3rem',
                fontWeight: '600'
              }}>{faq.question}</strong>
              <p style={{
                margin: '0',
                color: '#234d20',
                fontSize: '1rem',
                opacity: '0.92'
              }}>{faq.answer}</p>
            </li>
          ))}
        </ul>
      </section>

      <hr style={{
        border: 'none',
        borderTop: '2px dashed #a7d12944',
        margin: '0.5rem 0 1.5rem 0'
      }} />

      <footer style={{
        textAlign: 'center',
        fontSize: '1rem',
        color: '#4e7a51',
        marginTop: '1.5rem',
        paddingBottom: '0.5rem',
        background: 'none'
      }} aria-label="Support and Contact">
        <p>
          Need more help? Email us at <a href="mailto:tkmdt.cos301@gmail.com" style={{
            color: '#234d20',
            textDecoration: 'underline',
            fontWeight: '500'
          }}>tkmdt.cos301@gmail.com</a>
        </p>
      </footer>
    </div>
  );
};

export default HelpPage;