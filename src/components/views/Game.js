import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import StompContext from 'components/contexts/StompContext';
import "styles/views/Game.scss";
import HowToPlay from 'components/ui/HowToPlay';
import ShowDown from 'components/ui/ShowDown';
import EndOfGame from 'components/ui/EndOfGame';
import axios from 'axios';
import { useContext } from 'react';
import { useHistory } from 'react-router-dom';



const Game = () => {
  const location = useLocation();

  const [gamePhase, setGamePhase] = useState(''); //?
  const [winner, setWinner] = useState(null); 
  const [gameEnd, setGameEnd] = useState(false);
  const [pot, setPot] = useState(0);
  const [decisionAmount, setDecisionAmount] = useState(0);
  const [callAmount, setCallAmount] = useState(0);
  const [myHand, setMyHand] = useState([]);
  const [playersDecision, setPlayersDecision] = useState([]);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showShowDown, setShowShowDown] = useState(false);
  const [comments, setComments] = useState([]);
  const [ShowLeaveModal, setShowLeaveModal] = useState(false);

  const [bigBlind, setBigBlind] = useState(0);
  const [smallBlind, setSmallBlind] = useState(0);
  const [handleShowDown, setHandleShowDown] = useState(false);
  const [handleEndOfGame, setHandleEndOfGame] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const { stompClient } = useContext(StompContext);
  const { setStompClient } = useContext(StompContext);
  const { connect } = useContext(StompContext);

  const [playerList, setPlayerList] = useState([]);
  const history = useHistory();
  // define state variables for video data
  // {"title":null,"thumbnailUrl":null,"views":69823295,"likes":656792,"releaseDate":null,"duration":"PT1M48S"}
  const [videoData, setVideoData] = useState({
    title: "",
    thumbnailUrl: "",
    views: "",
    likes: "",
    releaseDate: "",
    duration: "",
  });

  const handleCommentsUpdate = (message) => {
    const data = JSON.parse(message.body);
    setComments(data);
  }

  const handlePlayerListUpdate = (message) => {
    const data = JSON.parse(message.body);
    setPlayerList(data);
  };
  
  
  const handleVideoDataUpdate = (message) => {
    const data = JSON.parse(message.body);
    setVideoData(data);
  };

  const handleGameUpdate = (message) => {
    const data = JSON.parse(message.body);
      setPot(data.potAmount);
      setPlayerList(data.players);
      setBigBlind(data.bigBlind);
      setSmallBlind(data.smallBlind);
      setCallAmount(data.callAmount);
      setGamePhase(data.gamePhase);
  };
  

  useEffect(() => {
    const createStompClient = async () => {
      const stompClient = await connect();
      return stompClient;
    };
  
    if (!stompClient) {
      createStompClient().then((client) => {
        setStompClient(client);
      });
    }
  }, [stompClient, connect, setStompClient]);


    useEffect(() => {
      const gameId = location.pathname.split("/")[2];
      const token = localStorage.getItem("token");
    // Subscribe to the game
    let gameSubscription;
    if (stompClient) {
      gameSubscription = stompClient.subscribe(
        `/topic/games/${gameId}/state`,
        handleGameUpdate
      );

    // Subscribe to the video
      const videoSubscription = stompClient.subscribe(
        `/topic/games/${gameId}/video`,
        handleVideoDataUpdate
      );
      const playerListSubscription = stompClient.subscribe(
        `/topic/games/${gameId}/players`,
        handlePlayerListUpdate
      );
      
      //subscribe to the comments
        const commentsSubscription = stompClient.subscribe(
          `/topic/games/${gameId}/players/${token}/hand`,
            handleCommentsUpdate
        );
        //subscribe to the decision
        const decisionSubscription = stompClient.subscribe(
          `/topic/games/${gameId}/players/${token}/decision`,
          (message) => {
            const data = JSON.parse(message.body);
            setPlayersDecision(data);
          }
        );
        //subscribe to the winner 
        const winnerSubscription = stompClient.subscribe(
          `/topic/games/${gameId}/state/winner`,
          (message) => {
            const data = JSON.parse(message.body);
            setWinner(data);
          }
        );
        //subscribe to the game end
        const gameEndSubscription = stompClient.subscribe(
          `/topic/games/${gameId}/state/end`,
          (message) => {
            const data = JSON.parse(message.body);
            setGameEnd(data);
          }
        );
        return () => {
          if (gameSubscription) {
            gameSubscription.unsubscribe();
          }
          if (videoSubscription) {
            videoSubscription.unsubscribe();
          }
          if (playerListSubscription) {
            playerListSubscription.unsubscribe();
          }
          if (commentsSubscription) {
            commentsSubscription.unsubscribe();
          }
          if (decisionSubscription) {
            decisionSubscription.unsubscribe();
          }
          if (winnerSubscription) {
            winnerSubscription.unsubscribe();
          }
          if (gameEndSubscription) {
            gameEndSubscription.unsubscribe();
          };
        };
      }
    }, [stompClient, location.pathname]);



    const handleDecisionSubmit = (decisionType) => {
      const gameId = location.pathname.split('/')[2];
      const token = localStorage.getItem('token');
      const decisionValue = parseInt(decisionAmount) || 0;
      const decisionData = {
        token: token,
        decision: decisionType,
        amount: decisionValue,
      };
      stompClient.send(`/app/games/${gameId}/players/${token}/decision`, {}, JSON.stringify(decisionData));
    };
    
    const handleCall = () => {
      handleDecisionSubmit('call');
    };
    
    const handleRaise = () => {
      handleDecisionSubmit('raise');
    };
    
    const handleLeaveGame = () => {
      setShowLeaveModal(true);
    };

    // confirm leave
    const handleConfirmLeave = () => {
      const gameId = location.pathname.split('/')[2];
      const username = localStorage.getItem('username');
      const token = localStorage.getItem('token');
      stompClient.send(`/app/games/${gameId}/players/remove`, {}, JSON.stringify({ username: username, token: token }));
      // Update player list in front-end
      handlePlayerListUpdate((prevPlayerList) => prevPlayerList.filter((player) => player.username !== username));
      setShowLeaveModal(false);
      // redirect to home page
      console.log('history:', history);
      history.push('/home');
    };
    // cancel leave
    const handleCancelLeave = () => {
      setShowLeaveModal(false);
    };

    const handleHelpClick = () => {
      setShowHowToPlay(true);
    };

    // handle winner
    const handleGameEnd = (gameEndMessage) => {
      setWinner(gameEndMessage.winner);
      setGamePhase(gameEndMessage.gamePhase);
      setGameEnd(true);
    };
    // show down
    const handleShowShowDown = () => {
      setShowShowDown(true);
    };
    // close show down
    const handleCloseShowDown = () => {
      setShowShowDown(false);
    };


  return (
    <div className = "game">
      <div className="box">    
      <div className="left">
      <ul className="player-list">
  {playerList?.length > 0 && playerList.map((player, index) => (
    <li key={index}>
      <a href={player.token ? `/users/${player.username}` : null}>{player.username}</a>
      <div>Score: {player.score}</div>
      {player.lastDecision && (
        <div>
          Last decision: {player.lastDecision === "NOT_DECIDED"
            ? "Not decided"
            : player.lastDecision.type === "call"
            ? `Called ${player.lastDecision.amount} points`
            : player.lastDecision.type === "raise"
            ? `Raised ${player.lastDecision.amount} points`
            : "Folded"
          }
        </div>
)}
    </li>
  ))}
</ul>
      </div>


  
        <div className="center">
          <div className="title">{videoData.title}</div>
          <div className="video-container">
            <div className="thumbnail" style={{ backgroundImage: `url(${videoData.thumbnailUrl})` }}></div>
          </div>
          <div className="stats">
            <p>Release Date: {videoData.releaseDate}</p>
            <p>Likes: {videoData.likes}</p>
            <p>Views: {videoData.views}</p>
          </div>
      </div>

  
  
      <div className="right">
        <div className="round-number">Round {gamePhase}</div>
        <div className="pot-amount">pot: {pot}</div>
        <input
          className="input-amount"
          type="number"
          placeholder="Enter amount..."
          value={decisionAmount}
          onChange={(event) => setDecisionAmount(event.target.value)}
        />
        <div className="button-container">
          <button className="call-button" onClick={handleCall}>call</button>
          <button className="raise-button" onClick={handleRaise}>raise</button>
          <button className="left-button" onClick={handleLeaveGame}>leave</button>
            <dialog open={ShowLeaveModal}>
              <div className="modal">
                <p>Are you sure you want to leave the game?</p>
                <div className="button-container">
                  <button className="confirm-button" onClick={handleConfirmLeave}>Yes</button>
                  <button className="cancel-button" onClick={handleCancelLeave}>No</button>
                </div>
              </div>
            </dialog>
          <button className="help-button" onClick={handleHelpClick}>help</button>
        </div>
      </div>
  
      <div className="footer">
      <div className="card-container">
        {comments.map((comment, index) => (
          <div className="card" key={index}>
            <div className="card-top">
              <span>{comment.first.author}</span>
              <i className="fas fa-heart"></i>
            </div>
            <div className="card-main">
              {comment.first.content}
            </div>
          </div>
        ))}
      </div>
    </div>
            
        {/* end of game section */}
        {gameEnd && <EndOfGame winner={winner} gamePhase={gamePhase} />}
        
    {/* Show how to play window when "help" button is clicked */}
    {showHowToPlay && <HowToPlay handleClose={() => setShowHowToPlay(false)} />}
    
    {/* Show show down window when "show down" button is clicked */}
    {showShowDown && <ShowDown handleClose={handleCloseShowDown} />}
    </div>
    </div>
  );
};

export default Game;
