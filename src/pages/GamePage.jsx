import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PhaserWrapper from '../components/PhaserWrapper';

function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [gameConfig, setGameConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Dynamically import the game config based on gameId
    const loadGame = async () => {
      try {
        setLoading(true);
        let config;
        
        switch(gameId) {
          case 'catch':
            config = (await import('../games/catch/config.js')).default;
            break;
          case 'dino':
            config = (await import('../games/dino/config.js')).default;
            break;
          case 'flappy':
            config = (await import('../games/flappy/config.js')).default;
            break;
          case 'frogger':
            config = (await import('../games/frogger/config.js')).default;
            break;
          case 'taps':
            config = (await import('../games/taps/config.js')).default;
            break;
          default:
            throw new Error('Game not found');
        }
        
        setGameConfig(config);
      } catch (err) {
        console.error('Error loading game:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [gameId]);

  if (loading) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <h2>Loading {gameId}...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <h2>Error: {error}</h2>
        <button 
          onClick={() => navigate('/')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '2px solid white',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          padding: '10px 20px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: '2px solid white',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        ← Menu
      </button>
      <PhaserWrapper gameConfig={gameConfig} />
    </div>
  );
}

export default GamePage;

