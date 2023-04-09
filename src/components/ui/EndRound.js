import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'antd';

// 1. show after each round

// 2. display the winner of this round, tell all players that current round ends, next round will begin

// 3. has a close tag so players can close the window

// 4. if players don't close, the window will disapper in 8 seconds 

// 5. then all players will be back to game interface

const EndOfRound = ({ winner, roundNumber }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <Modal visible={visible} onCancel={handleCancel} footer={null}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2>Round {roundNumber} Results</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ fontWeight: 'bold', fontSize: '24px' }}>{winner.player.username}</p>
          <p style={{ fontSize: '16px' }}>Wins {winner.pot} point!</p>
        </div>
      </div>
    </Modal>
  );
};

export default EndOfRound;
