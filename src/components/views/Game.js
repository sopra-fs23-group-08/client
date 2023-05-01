import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Stomp from 'stompjs';
import 'styles/views/TestGame.scss';
import HowToPlay from 'components/ui/HowToPlay';
import ShowDown from 'components/ui/ShowDown';
import EndOfGame from 'components/ui/EndOfGame';
import { connect } from 'net';
import axios from 'axios';
import SockJS from 'sockjs-client';


const Game = () => {
  const location = useLocation();
  const [stompClient, setStompClient] = useState(null);
  const [playerList, setPlayerList] = useState([]);
  const [gamePhase, setGamePhase] = useState(''); //?
  const [winner, setWinner] = useState(null); 
  const [gameEnd, setGameEnd] = useState(false);
  const [video, setVideo] = useState({});  //?
  const [pot, setPot] = useState(0);
  const [callAmount, setCallAmount] = useState(0);
  const [myHand, setMyHand] = useState([]);
  const [decision, setDecision] = useState('fold');//?
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showShowDown, setShowShowDown] = useState(false);
  const [comments, setComments] = useState([]);
  const [ShowLeaveModal, setShowLeaveModal] = useState(false);

  const [bigBlind, setBigBlind] = useState(0);
  const [smallBlind, setSmallBlind] = useState(0);
  const [handleHelpClick, setHandleHelpClick] = useState(false);
  const [handleLeaveGame, setHandleLeaveGame] = useState(false);
  const [handleShowDown, setHandleShowDown] = useState(false);
  const [handleEndOfGame, setHandleEndOfGame] = useState(false);


  // define state variables for video data
  const [videoData, setVideoData] = useState({
    title: "",
    thumbnail: "",
    releaseDate: "",
    likes: "",
    length: "",
    views: ""
  });
  // subscribe to player-list updates
  const [playersSubscription, setPlayersSubscription] = useState(null);
  // subscribe to video updates
  const [videoSubscription, setVideoSubscription] = useState(null);
  // subscribe to comments updates
  const [commentsSubscription, setCommentsSubscription] = useState(null);
  // subscribe to game updates
  const [gameSubscription, setGameSubscription] = useState(null);
  // subscribe to decision updates
  const [decisionSubscription, setDecisionSubscription] = useState(null);
  // subsribe to the winner
  const [winnerSubscription, setWinnerSubscription] = useState(null);
  // subscribe to game end
  const [gameEndSubscription, setGameEndSubscription] = useState(null);


  const [user, setUser] = useState(localStorage.getItem('user'));
  const [gameId, setGameId] = useState(localStorage.getItem('gameId'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));



  useEffect(() => {

    // connect WS
    async function connectSocket() {
      let socket = new SockJS("http://localhost:8080/sopra-websocket");
      const client = Stomp.over(socket);
      setStompClient(client);

      client.connect({}, () => {
        console.log("Websocket connection established");
      
        // SUBSCRIPTIONS //    
      setPlayersSubscription(client.subscribe(
          `/topic/games/${gameId}/players`,
          (message) => {
              const data = JSON.parse(message.body);
              setPlayerList(data);
          }
      ));
      setGameSubscription(client.subscribe(
          `/topic/games/${gameId}/state`,
          (message) => {
              const data = JSON.parse(message.body);
              setPot(data.potAmount);
              setPlayerList(data.players);
              setBigBlind(data.bigBlind);
              setSmallBlind(data.smallBlind);
              setCallAmount(data.callAmount);
              setGamePhase(data.gamePhase);
          }
      ));
      setVideoSubscription(client.subscribe(
          `/topic/games/${gameId}/state/video`,
          (message) => {
              const data = JSON.parse(message.body);
              setVideoData({
                  title: data.title,
                  thumbnail: data.thumbnail,
                  releaseDate: data.releaseDate,
                  likes: data.likes,
                  length: data.length,
                  views: data.views
              });
          }
      ));
      setCommentsSubscription(client.subscribe(
          `/topic/games/${gameId}/players/${user.id}/hand`,
          (message) => {
              const data = JSON.parse(message.body);
              setComments({
                  content: data.content,
                  author: data.author,
                  date: data.date,
                  likes: data.likes,
                  isMatched: data.is_matched
              });
          }
      ));
      setDecisionSubscription(client.subscribe(
          `/topic/games/${gameId}/players/${user.username}/decision`,
          (message) => {
              const data = JSON.parse(message.body);
              const player = playerList.find(player => player.username === data.username);
              const decision = player.lastDecision ? player.lastDecision.action : "No decision";
              const callAmount = player.lastDecision ? player.lastDecision.amount : "N/A";
              setDecision({
                  username: player.username,
                  decision: player.lastDecision,
                  callAmount: player.callAmount,
                  score: player.score,
                  token: player.token
              });
          }
      ));
      setWinnerSubscription(client.subscribe(
          `/topic/games/${gameId}/winner`,
          (message) => {
              const data = JSON.parse(message.body);
              setWinner({
                  username: data.username,
                  score: data.score,
                  token: data.token
              });
          }
      ));
      setGameEndSubscription(client.subscribe(
          `/topic/games/${gameId}/end`,
          (message) => {
              const data = JSON.parse(message.body);
              setGameEnd(true);
          }
      ));
      });
    }
    connectSocket();

    // CLEANUP and Unscribe //
    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
      if (gameSubscription) {
        gameSubscription.unsubscribe();
      }
      if (videoSubscription) {
        videoSubscription.unsubscribe();
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
      }
    };
  }, [gameId, location.pathname, stompClient, user]);


  useEffect(() => {
    // Send to app/.../players/.../decision
    const userToken = localStorage.getItem('Token');
    const username = localStorage.getItem('username');
    const handleDecisionSubmit = () => {
      const gameId = location.pathname.split('/')[2];
      let decisionValue;
      if (decision === 'raise') {
        decisionValue = parseInt(callAmount);
      } else if (decision === 'call') {
        decisionValue = parseInt(callAmount);
      } else {
        decisionValue = 0;
      }
      const decisionData = {
        decision: decision,
        amount: decisionValue,
      };
      if (stompClient !== null) {
        stompClient.send(`/app/games/${gameId}/players/${localStorage.getItem('userId')}/decision`, {}, JSON.stringify(decisionData));
      }
    };
    handleDecisionSubmit();

    const handleLeaveGame = () => {
      setShowLeaveModal(true);
      const gameId = location.pathname.split('/')[2];
      const playerId = localStorage.getItem('userId');
      const { username, token } = playerList.find(player => player.token === playerId);
      stompClient.send(`/app/games/${gameId}/players/remove`, {}, JSON.stringify({ username: username, token: token }));
      // Update player list in front-end
      setPlayerList((prevPlayerList) => prevPlayerList.filter((player) => player.username !== username));
    };
    // confirm leave
    const handleConfirmLeave = () => {
      const gameId = location.pathname.split('/')[2];
      const username = localStorage.getItem('username');
      const token = localStorage.getItem('Token');
      stompClient.send(`/app/games/${gameId}/players/remove`, {}, JSON.stringify({ username: username, token: token }));
      // Update player list in front-end
      setPlayerList((prevPlayerList) => prevPlayerList.filter((player) => player.username !== username));
      setShowLeaveModal(false);
      // redirect to home page
      window.location.href = '/home';
    };
    // cancel leave
    const handleCancelLeave = () => {
      setShowLeaveModal(false);
    };
    const handleHelpClick = () => {
      setShowHowToPlay(true);
    };
    // close help
    const handleCloseHelp = () => {
      setShowHowToPlay(false);
    };
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
  }, [playerList, decision, callAmount, winner, gamePhase,location.pathname, stompClient]);

  return (
    <body>
      <div className="box">
        
        <div className="left">
          <ul className="player-list">
            {playerList.map((player, index) => (
            <li key={index}>
              <a href={player.token ? `/users/${player.username}` : null}>{player.username}</a>
              {player.lastDecision && (
                <span>
                  {player.lastDecision.type === 'call'
                    ? `Called ${player.lastDecision.amount} points`
                    : player.lastDecision.type === 'raise'
                    ? `Raised ${player.lastDecision.amount} points`
                    : 'Folded'}
                    , has {player.score} points
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

  
        <div className="center">
          <div className="title">{videoData.title}</div>
          <div className="video-container">
            <div className="thumbnail" style={{ backgroundImage: `url(${videoData.thumbnail})` }}></div>
          </div>
          <div className="stats">
            <p>Date: {videoData.releaseDate}</p>
            <p>Likes: {videoData.likes}</p>
            <p>Views: {videoData.views}</p>
          </div>
      </div>

  
  
      <div className="right">
        <div className="round-number">Round {gamePhase}</div>
        <div className="pot-amount">pot: {pot}</div>
        <div className="input-amount">
          <input className="input-amount" type="number" placeholder="Enter amount..." />
        </div>
        <div className="button-container">
          <button className="call-button">call</button>
          <button className="raise-button">raise</button>
          <button className="left-button" onClick={handleLeaveGame}>
            leave
          </button>
          <button className="help-button" onClick={handleHelpClick}>help</button>
        </div>
      </div>
  
        <div className="footer">
          <div className="card-container">
            {myHand.map((comment, index) => (
              <div className="card" key={index}>
                <div className="card-top">
                  <span>{comment.author}</span>
                  <i className="fas fa-heart"></i>
                </div>
                <div className="card-main">
                  {comment.content}
                </div>
              </div>
            ))}
          </div>
      </div>
            
        {/* end of game section */}
        {gameEnd && <EndOfGame winner={winner} gamePhase={gamePhase} />}

        {/* Show confirmation window when "leave" button is clicked */}
        { ShowLeaveModal && (
        <div>
          <p>Are you sure you want to leave the game?</p>
          <button onClick={handleLeaveGame}>Yes</button>
          <button onClick={() => setShowLeaveModal(false)}>No</button>
        </div>
        )}
        
        {/* Show how to play window when "help" button is clicked */}
        {showHowToPlay && <HowToPlay handleClose={() => setShowHowToPlay(false)} />}

    </div>
    </body>
);
};

export default Game;
  
  