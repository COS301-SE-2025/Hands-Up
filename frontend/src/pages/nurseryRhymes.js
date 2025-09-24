import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Star, Heart, ArrowLeft, Video } from 'lucide-react';
import PropTypes from 'prop-types';
import { AngieSigns } from '../components/angieSigns';
import { getLandmarks } from '../utils/apiCalls';

const NURSERY_RHYMES = [
  {
    id: 'itsy-bitsy-spider',
    title: 'Itsy Bitsy Spider',
    emoji: '🕷️',
    bgGradient: 'linear-gradient(135deg, #9370DB 0%, #8A2BE2 50%, #4B0082 100%)',
    shadowColor: 'rgba(147, 112, 219, 0.4)',
    words: ['itsy', 'bitsy', 'spider', 'climbed', 'up', 'water', 'spout', 'down', 'came', 'rain', 'washed', 'out'],
    lines: [
      'The itsy bitsy spider climbed up the water spout',
      'Down came the rain and washed the spider out',
      'Out came the sun and dried up all the rain',
      'And the itsy bitsy spider climbed up the spout again'
    ],
    decorations: ['🕷️', '🌧️', '☀️', '💧'],
    videoId: 'BFXHaXacZjw',
    videoDuration: 120,
    landmarkWord: 'myBrotherAndSister'
  },
  {
    id: 'baby-shark',
    title: 'Baby Shark',
    emoji: '🦈',
    bgGradient: 'linear-gradient(135deg, #00BFFF 0%, #1E90FF 50%, #0000CD 100%)',
    shadowColor: 'rgba(30, 144, 255, 0.4)',
    words: ['baby', 'shark', 'doo', 'mommy', 'daddy', 'grandma', 'grandpa', 'lets', 'go', 'hunt', 'run', 'away'],
    lines: [
      'Baby shark, doo doo doo doo doo doo',
      'Baby shark, doo doo doo doo doo doo',
      'Baby shark, doo doo doo doo doo doo',
      'Baby shark!'
    ],
    decorations: ['🦈', '🌊', '🐠', '💙'],
    videoId: 'XqZsoesa55w',
    videoDuration: 106,
    landmarkWord: 'niceToMeetYou'
  },
  {
    id: 'wheels-bus',
    title: 'The Wheels on the Bus',
    emoji: '🚌',
    bgGradient: 'linear-gradient(135deg, #09ff00ff 0%, #32CD32 50%, #228B22 100%)',
    shadowColor: 'rgba(255, 69, 0, 0.4)',
    words: ['wheels', 'bus', 'go', 'round', 'all', 'through', 'town', 'wipers', 'swish', 'doors', 'open', 'shut'],
    lines: [
      'The wheels on the bus go round and round',
      'Round and round, round and round',
      'The wheels on the bus go round and round',
      'All through the town'
    ],
    decorations: ['🚌', '🎵', '🏢', '🛣️'],
    videoId: 'e_04ZrNroTo',
    videoDuration: 142,
    landmarkWord: 'myPetDog'
  }
];

const ModelLoadingFallback = () => (
  <div className="loading-container">
    <div className="bouncing-balls">
      <div className="ball ball-1"></div>
      <div className="ball ball-2"></div>
      <div className="ball ball-3"></div>
    </div>
    <div className="loading-text">Angie is getting ready!</div>
  </div>
);

const FloatingDecoration = ({ emoji, delay, duration = 4 }) => (
  <div 
    className="floating-decoration"
    style={{
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`
    }}
  >
    {emoji}
  </div>
);

FloatingDecoration.propTypes = {
  emoji: PropTypes.string.isRequired,
  delay: PropTypes.number.isRequired,
  duration: PropTypes.number
}

export function NurseryRhymesPage() {
  const [selectedRhyme, setSelectedRhyme] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [videoPlayer, setVideoPlayer] = useState(null);
  const intervalRef = useRef(null);

  const loadLandmarks = useCallback(async (landmarkWord) => {
    setLoading(true);
    try {
      const data = await getLandmarks(landmarkWord);
      setLandmarks(data || []);
    } catch (error) {
      console.error('Failed to load landmarks for:', landmarkWord, error);
      setLandmarks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = (rhymeId) => {
    setFavorites(prev => 
      prev.includes(rhymeId) 
        ? prev.filter(id => id !== rhymeId)
        : [...prev, rhymeId]
    );
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (videoPlayer) {
      if (isMuted) {
        videoPlayer.unMute();
      } else {
        videoPlayer.mute();
      }
    }
  };

  const startPlayback = useCallback(async () => {
    if (!selectedRhyme || isPlaying) return;
    
    setIsPlaying(true);
    
    if (videoPlayer) {
      videoPlayer.playVideo();
    }
    
    await loadLandmarks(selectedRhyme.landmarkWord);
    setReplayKey(prev => prev + 1);
    
    let wordIndex = 0;
    const wordDuration = selectedRhyme.videoDuration ? 
      (selectedRhyme.videoDuration * 1000) / selectedRhyme.words.length : 3000;
    
    const playNextWord = async () => {
      if (wordIndex >= selectedRhyme.words.length) {
        setIsPlaying(false);
        if (videoPlayer) {
          videoPlayer.pauseVideo();
        }
        return;
      }
      
      wordIndex++;
      intervalRef.current = setTimeout(playNextWord, wordDuration);
    };
    
    playNextWord();
  }, [selectedRhyme, isPlaying, loadLandmarks, videoPlayer]);

  const pausePlayback = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }
    if (videoPlayer) {
      videoPlayer.pauseVideo();
    }
  }, [videoPlayer]);

  const resetPlayback = useCallback(() => {
    pausePlayback();
    if (videoPlayer) {
      videoPlayer.seekTo(0);
    }
    if (selectedRhyme) {
      loadLandmarks(selectedRhyme.landmarkWord);
    }
  }, [selectedRhyme, pausePlayback, loadLandmarks, videoPlayer]);

 
useEffect(() => {
  if (selectedRhyme) {
    let player;
    
    const initializePlayer = () => {
      if (window.YT && window.YT.Player) {
        // Destroy existing player first
        if (videoPlayer) {
          videoPlayer.destroy();
        }
        
        player = new window.YT.Player('youtube-player', {
          height: '100%',
          width: '100%',
          videoId: selectedRhyme.videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            disablekb: 0,
            fs: 1,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            showinfo: 0
          },
          events: {
            onReady: () => {
              setVideoPlayer(player);
              if (isMuted) {
                player.mute();
              }
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                setIsPlaying(false);
              }
            }
          }
        });
      }
    };

    // Load YouTube API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    loadLandmarks(selectedRhyme.landmarkWord);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      if (player) {
        player.destroy();
      }
    };
  }
}, [selectedRhyme, isMuted, loadLandmarks,videoPlayer]); 

  const RhymeCard = ({ rhyme }) => (
    <div 
      className="rhyme-card"
      onClick={() => setSelectedRhyme(rhyme)}
      style={{
        background: rhyme.bgGradient,
        boxShadow: `0 15px 35px ${rhyme.shadowColor}`
      }}
    >
      <div className="card-decorations">
        {rhyme.decorations?.map((decoration, index) => (
          <div 
            key={index} 
            className={`decoration decoration-${index + 1}`}
          >
            {decoration}
          </div>
        ))}
      </div>
      
      <div className="card-content">
        <div className="card-header">
          <div className="main-emoji">{rhyme.emoji}</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(rhyme.id);
            }}
            className="favorite-btn"
          >
            <Heart 
              className={favorites.includes(rhyme.id) ? 'favorited' : ''}
            />
          </button>
        </div>
        
        <h3 className="card-title">{rhyme.title}</h3>
        
        <div className="lyrics-preview">
          {rhyme.lines.slice(0, 2).map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        
        <div className="card-footer">
          <div className="video-indicator">
            <Video size={16} />
            Video + Signs
          </div>
          <div className="stars">
            {[...Array(3)].map((_, i) => (
              <Star key={i} className="star" />
            ))}
          </div>
        </div>
      </div>
      
      <div className="shine-effect"></div>
    </div>
  );

   RhymeCard.propTypes = {
    rhyme: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      bgGradient: PropTypes.string,
      shadowColor: PropTypes.string,
      decorations: PropTypes.array,
      emoji: PropTypes.string,
      lines: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired
  };


  if (selectedRhyme) {
    return (
      <div className="nursery-detail-page">
        

        <div className="detail-container">
          <div className="detail-header">
            <button 
              className="back-btn"
              onClick={() => setSelectedRhyme(null)}
            >
              <ArrowLeft size={20} />
              Back to Rhymes
            </button>
            
            <div className="rhyme-info" style={{ background: selectedRhyme.bgGradient }}>
              <div className="rhyme-emoji">{selectedRhyme.emoji}</div>
              <div>
                <h1>{selectedRhyme.title}</h1>
                <p>Watch the video and learn signs with Angie!</p>
              </div>
            </div>
          </div>

          <div className="main-content">
            <div className="media-container">
              <div className="video-container">
                <div className="video-frame">
                  <div id="youtube-player" className="youtube-player"></div>
                  <div className="angie-overlay">
                    <div className="canvas-container-overlay">
                      {loading ? (
                        <ModelLoadingFallback />
                      ) : (
                        <Suspense fallback={<ModelLoadingFallback />}>
                          <Canvas camera={{ position: [0, 0.2, 2], fov: 40 }}>
                            {/* eslint-disable react/no-unknown-property */}
                            <ambientLight intensity={5} />
                            {/* eslint-disable react/no-unknown-property */}
                            <group position={[0, -0.9, 0]}>
                              <AngieSigns 
                                landmarks={landmarks} 
                                replay={replayKey}
                                duration={2.5}
                              />
                            </group>
                            <OrbitControls 
                              enablePan={false} 
                              maxPolarAngle={Math.PI / 2} 
                              minDistance={2.5} 
                              maxDistance={3.5} 
                            />
                          </Canvas>
                        </Suspense>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="controls">
                <button
                  onClick={isPlaying ? pausePlayback : startPlayback}
                  className={`control-btn ${isPlaying ? 'pause' : 'play'}`}
                  disabled={loading}
                >
                  {isPlaying ? <Pause /> : <Play />}
                  {isPlaying ? 'Pause' : 'Play Video'}
                </button>
                
                <button
                  onClick={resetPlayback}
                  className="control-btn reset"
                  disabled={loading}
                >
                  <RotateCcw />
                  Restart
                </button>
                
                <button
                  onClick={toggleMute}
                  className={`control-btn ${isMuted ? 'muted' : 'unmuted'}`}
                >
                  {isMuted ? <VolumeX /> : <Volume2 />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .nursery-detail-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #FFE5F1 0%, #E5F3FF 30%, #F0FFFF 60%, #FFF0F5 100%);
            position: relative;
            min-width:1330px;
            overflow-x: auto;
            font-family: 'Comic Neue', 'Fredoka One', 'Arial Rounded MT', sans-serif;
          }

          .background-decorations {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            overflow: hidden;
            z-index: 1;
          }

          .floating-decoration {
            position: absolute;
            font-size: 2.5rem;
            opacity: 0.3;
            animation: magical-float infinite ease-in-out;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
          }

          @keyframes magical-float {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg) scale(1); 
              opacity: 0.3; 
            }
            50% { 
              transform: translateY(-20px) rotate(5deg) scale(1.1); 
              opacity: 0.6; 
            }
          }

          .detail-container {
            position: relative;
            z-index: 10;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .detail-header {
            text-align: center;
            margin-bottom: 40px;
          }

          .back-btn {
            position: absolute;
            top: 20px;
            left: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 15px 25px;
            background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
            border: none;
            border-radius: 50px;
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
            transition: all 0.3s ease;
            z-index: 100;
            color: white;
          }

          .back-btn:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
          }

          .rhyme-info {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 25px;
            padding: 40px;
            border-radius: 30px;
            color: white;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
            margin: 80px auto 0;
            border: 3px solid rgba(255, 255, 255, 0.3);
          }

          .rhyme-emoji {
            font-size: 5rem;
            filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
            animation: gentle-bounce 2s infinite ease-in-out;
          }

          @keyframes gentle-bounce {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }

          .main-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }

          .media-container {
            width: 100%;
            max-width: 1000px;
          }

          .video-container {
            margin-bottom: 20px;
            min-width:800px;
          }

          .video-frame {
            aspect-ratio: 16/9;
            position: relative;
            width: 100%;
            background: #000;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          }

          .youtube-player {
            width: 100%;
            height: 100%;
            border: none;
          }

          .angie-overlay {
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 180px;
            min-height: 220px;
            background: linear-gradient(135deg, #FFE5B4, #FFEBCD);
            border-radius: 15px;
            border: 3px solid #FFD700;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
            z-index: 10;
          }

          .canvas-container-overlay {
            width: 100%;
            min-height: 220px;
            border-radius: 12px;
            overflow: hidden;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .bouncing-balls {
            display: flex;
            gap: 8px;
            margin-bottom: 20px;
          }

          .ball {
            width: 15px;
            height: 15px;
            border-radius: 50%;
            animation: bounce 1.4s infinite ease-in-out;
          }

          .ball-1 { background: #FF6B6B; animation-delay: -0.32s; }
          .ball-2 { background: #4ECDC4; animation-delay: -0.16s; }
          .ball-3 { background: #FFEAA7; }

          @keyframes bounce {
            0%, 80%, 100% { 
              transform: scale(0) translateY(0); 
              opacity: 0.5; 
            }
            40% { 
              transform: scale(1) translateY(-20px); 
              opacity: 1; 
            }
          }

          .loading-text {
            font-size: 1.4rem;
            font-weight: 700;
            animation: pulse-text 1.5s infinite;
          }

          @keyframes pulse-text {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }

          .controls {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
          }

          .control-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 14px 24px;
            border: none;
            border-radius: 25px;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
            position: relative;
            overflow: hidden;
          }

          .control-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s ease;
          }

          .control-btn:hover:not(:disabled)::before {
            left: 100%;
          }

          .control-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .control-btn.play {
            background: linear-gradient(135deg, #32CD32, #228B22);
            color: white;
          }

          .control-btn.pause {
            background: linear-gradient(135deg, #FF6B6B, #DC143C);
            color: white;
          }

          .control-btn.reset {
            background: linear-gradient(135deg, #4169E1, #0000FF);
            color: white;
          }

          .control-btn.unmuted {
            background: linear-gradient(135deg, #9370DB, #4B0082);
            color: white;
          }

          .control-btn.muted {
            background: linear-gradient(135deg, #808080, #696969);
            color: white;
          }

          .control-btn:hover:not(:disabled) {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          }

          @media (max-width: 768px) {
            .detail-container {
              padding: 15px;
            }
            
            .rhyme-info {
              flex-direction: column;
              gap: 15px;
              padding: 25px;
            }
            
            .rhyme-emoji {
              font-size: 4rem;
            }
            
            .angie-overlay {
              width: 150px;
              height: 2000px;
              bottom: 15px;
              right: 15px;
            }
            
            .controls {
              gap: 10px;
            }
            
            .control-btn {
              padding: 12px 20px;
              font-size: 0.9rem;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="nursery-main-page">
      <div className="main-background-decorations">
        {[...Array(40)].map((_, i) => (
          <FloatingDecoration
            key={i}
            emoji={['🌟', '🎵', '🌈', '☁️', '🦋', '🌸', '⭐', '💫', '🎈', '🎪', '🎭', '🎨'][i % 12]}
            delay={i * 0.2}
            duration={4 + (i % 5)}
          />
        ))}
      </div>

      <div className="main-container">
        <div className="main-header">
          <div className="header-content">
            <div className="title-section">
              <div>
                <h1 className="main-title">Nursery Rhymes with Angie</h1>
                <p className="subtitle">Watch videos and learn sign language together!</p>
              </div>
            </div>
            
            <div className="feature-badges">
              <div className="badge video">
                <span className="badge-emoji"></span>
                YouTube Videos
              </div>
              <div className="badge interactive">
                <span className="badge-emoji"></span>
                Sign Learning
              </div>
              <div className="badge kids">
                <span className="badge-emoji"></span>
                Kid Friendly
              </div>
            </div>
          </div>
        </div>

        <div className="rhymes-grid">
          {NURSERY_RHYMES.map((rhyme) => (
            <RhymeCard key={rhyme.id} rhyme={rhyme} />
          ))}
        </div>
      </div>

      <style jsx>{`
        .nursery-main-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #FFE5F1 0%, #E5F3FF 25%, #F0FFFF 50%, #FFF0F5 75%, #E8F5E8 100%);
          position: relative;
          width: 100%;
          overflow-x: hidden;
          font-family: 'Comic Neue', 'Fredoka One', 'Arial Rounded MT', sans-serif;
        }

        .main-background-decorations {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        }

        .main-container {
          position: relative;
          z-index: 10;
          padding: 30px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .main-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .header-content {
          background-image: linear-gradient(90deg, #FFC542, #bdd957, #7ED957);
  
          border-radius: 30px;
          padding: 40px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 3px solid rgba(255, 255, 255, 0.5);
          position: relative;
          overflow: hidden;
        }

        .header-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7);
          animation: rainbow-flow 3s linear infinite;
          background-size: 200% 100%;
        }

        @keyframes rainbow-flow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .title-section {
          display: flex;
          
          align-items: center;
          justify-content: center;
          gap: 30px;
          margin-bottom: 30px;
        }

        .main-title {
          font-size: 3.5rem;
          font-weight: 900;
          background: black;
          background-clip: text;
          margin: 0;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          letter-spacing: 2px;
        }

        .subtitle {
          font-size: 1.6rem;
          color: #555;
          margin: 10px 0 0 0;
          font-weight: 600;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }

        .feature-badges {
          display: flex;
          justify-content: center;
          gap: 25px;
          flex-wrap: wrap;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px 25px;
          border-radius: 25px;
          font-weight: 700;
          font-size: 1.1rem;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .badge:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
        }

        .badge.video {
          background: linear-gradient(135deg, #FFD700, #FFEAA7);
          color: white;
        }

        .badge.interactive {
          background: linear-gradient(135deg, #32CD32, #90EE90);
          color: white;
        }

        .badge.kids {
          background: linear-gradient(135deg, #FFD700, #FFEAA7);
          color: #ffffffff;
        }

        .badge-emoji {
          font-size: 1.5rem;
          filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.2));
        }

        .rhymes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 40px;
          margin-top: 40px;
        }

        .rhyme-card {
          background: white;
          border-radius: 25px;
          padding: 30px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 3px solid rgba(255, 255, 255, 0.5);
          position: relative;
          overflow: hidden;
          min-height: 320px;
        }

        .rhyme-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);
        }

        .card-decorations {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
        }

        .decoration {
          position: absolute;
          font-size: 2rem;
          opacity: 0.3;
          animation: card-float 4s infinite ease-in-out;
        }

        .decoration-1 {
          top: 15px;
          right: 20px;
          animation-delay: 0s;
        }

        .decoration-2 {
          top: 50%;
          left: 15px;
          animation-delay: 1s;
        }

        .decoration-3 {
          bottom: 20px;
          right: 25px;
          animation-delay: 2s;
        }

        .decoration-4 {
          top: 30%;
          right: 15px;
          animation-delay: 3s;
        }

        @keyframes card-float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.3; 
          }
          50% { 
            transform: translateY(-10px) rotate(5deg); 
            opacity: 0.6; 
          }
        }

        .card-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .main-emoji {
          font-size: 4rem;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
          animation: emoji-pulse 2s infinite ease-in-out;
        }

        @keyframes emoji-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .favorite-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .favorite-btn:hover {
          transform: scale(1.2);
          background: rgba(255, 255, 255, 1);
        }

        .favorite-btn .favorited {
          color: #FF6B6B;
          fill: currentColor;
        }

        .card-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          margin-bottom: 20px;
          text-align: center;
          letter-spacing: 1px;
        }

        .lyrics-preview {
          flex-grow: 1;
          margin-bottom: 20px;
        }

        .lyrics-preview p {
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
          margin: 8px 0;
          text-align: center;
          opacity: 0.95;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          border-top: 2px solid rgba(255, 255, 255, 0.3);
        }

        .video-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
          background: rgba(0, 0, 0, 0.2);
          padding: 6px 12px;
          border-radius: 15px;
          backdrop-filter: blur(5px);
        }

        .stars {
          display: flex;
          gap: 3px;
        }

        .star {
          color: #FFD700;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
          animation: star-twinkle 2s infinite ease-in-out;
        }

        .star:nth-child(2) { animation-delay: 0.5s; }
        .star:nth-child(3) { animation-delay: 1s; }

        @keyframes star-twinkle {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .shine-effect {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.6s ease;
          z-index: 3;
          pointer-events: none;
        }

        .rhyme-card:hover .shine-effect {
          left: 100%;
        }

        @media (max-width: 768px) {
          .main-container {
            padding: 20px;
          }
          
          .rhymes-grid {
            grid-template-columns: 1fr;
            gap: 25px;
          }
          
          .rhyme-card {
            padding: 25px;
            min-height: 280px;
          }
          
          .main-title {
            font-size: 2rem;
          }
          
          .subtitle {
            font-size: 1.3rem;
          }
          
          .feature-badges {
            gap: 15px;
          }
          
          .badge {
            padding: 12px 20px;
            font-size: 1rem;
          }
        }

        @media (max-width: 768px) {
          .title-section {
            flex-direction: column;
            gap: 20px;
          }
        }

        @media (max-width: 480px) {
          .rhymes-grid {
            grid-template-columns: 1fr;
          }
          
          .main-title {
            font-size: 2.5rem;
          }
          
          .subtitle {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
}

NurseryRhymesPage.propTypes = {
  rhyme: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    bgGradient: PropTypes.string,
    shadowColor: PropTypes.string,
    decorations: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
      })
    ),
    emoji: PropTypes.string,
    lines: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  emoji: PropTypes.string,
  delay: PropTypes.number,
  duration: PropTypes.number,
  currentWordIndex: PropTypes.number,
  videoPlayer: PropTypes.object, 
};