import React from 'react';
import { useHistory } from 'react-router-dom';

const ShowDown = ({ winner, playerHands }) => {
  const history = useHistory();

  const handleClose = () => {
    history.push('/');
  };

  return (
    <div className="game-end">
      <div className="winner">{winner} wins!</div>
      <div className="player-hands">
        {playerHands.map((hand, index) => (
          <div key={index} className="player-hand">
            <div className="username">{hand.username}</div>
            <div className="cards">
              {hand.cards.map((card, index) => (
                <div
                  key={index}
                  className={`card ${card.is_matched ? 'matched' : ''}`}
                >
                  <div className="card-top">
                    <span>{card.author}</span>
                  </div>
                  <div className="card-main">{card.content}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="close-button" onClick={handleClose}>
        Close
      </button>
    </div>
  );
};

export default ShowDown;
