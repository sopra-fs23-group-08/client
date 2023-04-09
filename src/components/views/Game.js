import React, { useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import EndOfRound from '../ui/EndOfRound';
import { HowToPlay } from './components/ui/HowToPlay';


const ENDPOINT = 'http://localhost:4001';

const Game = () => {
  const [players, setPlayers] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentPot, setCurrentPot] = useState(0);
  const [myCards, setMyCards] = useState([]);
  const [winner, setWinner] = useState(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on('connect', () => {
      console.log('Connected to server!');
    });

    socket.on('players', (data) => {
      setPlayers(data.players);
    });

    socket.on('video', (data) => {
      setCurrentVideo(data.video);
    });

    socket.on('round', (data) => {
      setCurrentRound(data.round);
    });

    socket.on('pot', (data) => {
      setCurrentPot(data.pot);
    });

    socket.on('myCards', (data) => {
      setMyCards(data.cards);
    });

    socket.on('winner', (data) => {
      setWinner(data.winner);
    });

    return () => socket.disconnect();
  }, []);

  const handleLeaveGame = () => {
    const socket = socketIOClient(ENDPOINT);
    socket.emit('leaveGame');
    socket.disconnect();
    // Navigate to home page
  };

  const handleCall = (amount) => {
    const socket = socketIOClient(ENDPOINT);
    socket.emit('call', { amount });
  };

  const handleRaise = (amount) => {
    const socket = socketIOClient(ENDPOINT);
    socket.emit('raise', { amount });
  };

  const handleHelp = () => {
    // Handle help button logic
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', flexGrow: 1 }}>
        <PlayerList players={players} />
        <VideoInfo currentVideo={currentVideo} currentRound={currentRound} currentPot={currentPot} />
        <DecisionArea onLeaveGame={handleLeaveGame} onCall={handleCall} onRaise={handleRaise} onHelp={handleHelp} />
        <HowToPlay />
      </div>
      <MyCommentCards myCards={myCards} />
      {winner && (
        <div>
          {winner && <EndOfRound winner={winner} roundNumber={currentRound} />}  
          {winner.type === 'game' && <p>Game winner: {winner.player.username}</p>}
        </div>
      )}
    </div>
  );
};



export default Game;
