//import { useState, useEffect, useContext, useRef } from 'react';
//import { useParams, useHistory } from 'react-router-dom';
//import UserContext from "../contexts/UserContext";
//import StompContext from 'components/contexts/StompContext';
//import "styles/views/Game.scss";
//import HowToPlay from 'components/ui/HowToPlay';
//import ShowDown from 'components/ui/ShowDown';
//import EndOfGame from 'components/ui/EndOfGame';
//import { message } from 'antd';
//import { useCallback } from 'react';
//
//
//
//const TestGame = () => {
//
//  const [gamePhase, setGamePhase] = useState(''); //?
//  const [winner, setWinner] = useState(null); 
//  const [gameEnd, setGameEnd] = useState(false);
//  const [pot, setPot] = useState(0);
//  const [decisionAmount, setDecisionAmount] = useState(0);
//  const [callAmount, setCallAmount] = useState(0);
//  const [playersDecision, setPlayersDecision] = useState([]);
//  const [showHowToPlay, setShowHowToPlay] = useState(false);
//  const [showShowDown, setShowShowDown] = useState(false);
//  const [comments, setComments] = useState([]);
//  const [ShowLeaveModal, setShowLeaveModal] = useState(false);
//
//  const [bigBlind, setBigBlind] = useState(0);
//  const [smallBlind,setSmallBlind] = useState(0);
//
//  /** View info */
//  const isMounted = useRef(true); // flag to avoid state updates after unmount
//  //const gameStarting = useRef(true);
//  const history = useHistory();
//  const { gameId } = useParams();
//
//  /** Websocket */
//  const { stompClient } = useContext(StompContext);
//  const { connect } = useContext(StompContext);
//  const playerListSubscription = useRef(null);
//  const videoDataSubscription = useRef(null);
//  const gameSubscription = useRef(null);
//  const commentsSubscription = useRef(null);
//  const decisionSubscription = useRef(null);
//  const winnerSubscription = useRef(null);
//  const gameEndSubscription = useRef(null);
//
//  // ** User info */
//  const {user} = useContext(UserContext);
//  const [playerList, setPlayerList] = useState([]);
//  const [currentPlayerUsername, setCurrentPlayerUsername] = useState('');
//  const [currentPlayer, setCurrentPlayer] = useState('')
//
//  // define state variables for video data
//  // {"title":null,"thumbnailUrl":null,"views":69823295,"likes":656792,"releaseDate":null,"duration":"PT1M48S"}
//  const [videoData, setVideoData] = useState({
//    title: "",
//    thumbnailUrl: "",
//    views: "",
//    likes: "",
//    releaseDate: "",
//    duration: "",
//  });
//
//  const handleCommentsUpdate = useCallback((message) => {
//    const data = JSON.parse(message.body);
//    // Only update the state if there are changes to the comments
//    if (isMounted.current === true && JSON.stringify(comments) !== JSON.stringify(data))
//    setComments(data);
//  }, [comments]);
//
//  const handlePlayerListUpdate = useCallback((message) => {
//    const data = JSON.parse(message.body);
//    // Only update the state if there are changes to the player list
//    if (isMounted.current === true && JSON.stringify(playerList) !== JSON.stringify(data))
//    setPlayerList(data);
//  }, [playerList]);
//  
//  const convertDuration = (duration) => {
//    const match = duration.match(/PT(\d+)M(\d+)S/);
//    if (match) {
//      const minutes = parseInt(match[1]);
//      const seconds = parseInt(match[2]);
//      return minutes + " min " + seconds + " sec";
//    }
//    return "";
//  }
//  
//  const handleVideoDataUpdate = useCallback((message) => {
//    const data = JSON.parse(message.body);
//    data.duration = convertDuration(data.duration);
//    // Only update the state if there are changes to the video data
//    if (isMounted.current === true && JSON.stringify(videoData) !== JSON.stringify(data))
//    setVideoData(data);
//  }, [videoData]);
//
//  const handleGameUpdate = useCallback((message) => {
//    const data = JSON.parse(message.body);
//    // Only update the state if there are changes to the game
//    if (isMounted.current === true && JSON.stringify(pot) !== JSON.stringify(data.potAmount))
//      setPot(data.potAmount);
//    if (isMounted.current === true && JSON.stringify(playerList) !== JSON.stringify(data.players))
//      setPlayerList(data.players);
//    if (isMounted.current === true && JSON.stringify(gamePhase) !== JSON.stringify(data.gamePhase))
//      setGamePhase(data.gamePhase);
//    if (isMounted.current === true && JSON.stringify(bigBlind) !== JSON.stringify(data.bigBlind))
//      setBigBlind(data.bigBlind);
//    if (isMounted.current === true && JSON.stringify(smallBlind) !== JSON.stringify(data.smallBlind))
//      setSmallBlind(data.smallBlind);
//    if (isMounted.current === true && JSON.stringify(callAmount) !== JSON.stringify(data.callAmount))
//      setCallAmount(data.callAmount);
//  }, [pot, playerList, gamePhase, bigBlind, smallBlind, callAmount]);
//  
//  const handleCurrentPlayer = useCallback((message) => {
//    const data = JSON.parse(message.body);
//    const currentPlayer = data.find((player) => player.currentPlayer === true);
//    console.log('currentPlayer:', currentPlayer);
//    if (currentPlayer) {
//      setCurrentPlayer(currentPlayer);
//      setCurrentPlayerUsername(currentPlayer.username);
//    }
//  }, []);
//
//  const handleDecisionSubmit = useCallback((decisionType, raiseAmount) => {
//    const destination = `/app/games/${gameId}/players/${token}/decision`;
//    const token = user.token
//    const currentPlayer = currentPlayer;
//    if (currentPlayer.token === token) {
//      const decisionData = {
//      decision: decisionType,
//      raiseAmount: raiseAmount,
//    }
//    const requestBody = JSON.stringify(decisionData);
//    stompClient.current.send(destination, {}, requestBody);
//    }else{
//      message.error('It is not your turn!');
//    }
//  }, [gameId, user.token, currentPlayer, stompClient]);
//
//
//  const handleCall = () => {
//    const raiseAmount = parseInt(decisionAmount) || 0;
//    handleDecisionSubmit('CALL', raiseAmount);
//  };
//  
//  const handleRaise = () => {
//    const raiseAmount = parseInt(decisionAmount) || 0;
//    handleDecisionSubmit('RAISE', raiseAmount);
//  };
//  
//  
//  const handleLeaveGame = () => {
//    setShowLeaveModal(true);
//  };
//
//  // confirm leave
//  const handleConfirmLeave = () => {
//    const destination = `/app/games/${gameId}/players/remove`
//    const username = user.name
//    const token = user.token
//    const requestBody = JSON.stringify({ username: username, token: token });
//    stompClient.current.send(destination, {}, requestBody);
//    // Update player list in front-end
//    handlePlayerListUpdate((prevPlayerList) => prevPlayerList.filter((player) => player.username !== username));
//    setShowLeaveModal(false);
//    // redirect to home page
//    console.log('history:', history);
//    history.push('/home');
//  };
//  // cancel leave
//  const handleCancelLeave = () => {
//    setShowLeaveModal(false);
//  };
//
//  const handleHelpClick = () => {
//    setShowHowToPlay(true);
//  };
//
//  // handle winner
//  // show down
//  // close show down
//  const handleCloseShowDown = () => {
//    setShowShowDown(false);
//  };
//
//    /** ON MOUNT/DISMOUNT */
//    //NOSONAR
//    useEffect(() => {
//        
//      window.addEventListener("beforeunload", handleLeaveGame);
//
//      // setup stomp client
//      const connectSocket = async () => {
//      const client = await connect();
//  
//      const token = user.token;
//      // SUBSCRIPTIONS //
//      // Subscribe to the game
//      gameSubscription.current = client.subscribe(
//        `/topic/games/${gameId}/state`,
//        handleGameUpdate
//      );
//
//      // Subscribe to the video
//      videoDataSubscription.current = client.subscribe(
//        `/topic/games/${gameId}/video`,
//        handleVideoDataUpdate
//      );
//      
//      // Subscribe to the player list
//      playerListSubscription.current = client.subscribe(
//        `/topic/games/${gameId}/players`,
//        message => {
//          handlePlayerListUpdate(message);
//          handleCurrentPlayer(message);
//        }
//      );
//      console.log('playerListSubscription:', playerListSubscription);
//      
//      //Subscribe to the comments
//      commentsSubscription.current = client.subscribe(
//          `/topic/games/${gameId}/players/${token}/hand`,
//            handleCommentsUpdate
//        );
//
//      //subscribe to the decision
//      decisionSubscription.current = client.subscribe(
//          `/topic/games/${gameId}/players/${token}/decision`,
//          (message) => {
//              console.log('decisionSubscription:', decisionSubscription);
//              const data = JSON.parse(message.body);
//              setPlayersDecision(data);
//          }
//      );
//            
//      //subscribe to the winner 
//      winnerSubscription.current = client.subscribe(
//          `/topic/games/${gameId}/state/winner`,
//          (message) => {
//            const data = JSON.parse(message.body);
//            setWinner(data);
//          }
//        );
//      
//      //subscribe to the game end
//      gameEndSubscription.current = client.subscribe(
//          `/topic/games/${gameId}/state/end`,
//          (message) => {
//            const data = JSON.parse(message.body);
//            setGameEnd(data);
//          }
//        );
//      };
//      connectSocket();
//
//        return () => {
//          if (gameSubscription.current) {
//            gameSubscription.current.unsubscribe();
//          }
//          if (videoDataSubscription.current) {
//            videoDataSubscription.current.unsubscribe();
//          }
//          if (playerListSubscription.current) {
//            playerListSubscription.current.unsubscribe();
//          }
//          if (commentsSubscription.current) {
//            commentsSubscription.current.unsubscribe();
//          }
//          if (decisionSubscription.current) {
//            decisionSubscription.current.unsubscribe();
//          }
//          if (winnerSubscription.current) {
//            winnerSubscription.current.unsubscribe();
//          }
//          if (gameEndSubscription.current) {
//            gameEndSubscription.current.unsubscribe();
//          };
//        };
//      }, [connect, gameId, user.token, handlePlayerListUpdate, handleVideoDataUpdate, handleGameUpdate, handleCommentsUpdate, handleDecisionSubmit, handleCurrentPlayer]);
//
//  return (
//    <div className = "game">
//      <div className="box">    
//      <div className="left">
//      <ul className="player-list">
//  {playerList?.length > 0 && playerList.map((player, index) => (
//    <li key={index}>
//      <a href={player.token ? `/users/${player.username}` : null}>{player.username}</a>
//      <div>Score: {player.score}</div>
//      {player.lastDecision && (
//        <div>
//          Last decision: {player.lastDecision === "NOT_DECIDED"
//            ? "Not decided"
//            : player.lastDecision.type === "call"
//            ? `Called ${player.lastDecision.amount} points`
//            : player.lastDecision.type === "raise"
//            ? `Raised ${player.lastDecision.amount} points`
//            : "Folded"
//          }
//        </div>
//)}
//    </li>
//  ))}
//</ul>
//      </div>
//
//
//  
//        <div className="center">
//          <div className="announcement-container">
//            <p>Now it's {currentPlayerUsername}'s turn! </p>
//          </div>
//          <div className="title">{videoData.title}</div>
//          <div className="video-container">
//            <div className="thumbnail" style={{ backgroundImage: `url(${videoData.thumbnailUrl})` }}></div>
//          </div>
//          <div className="stats">
//            <p>Release Date: {videoData.releaseDate}</p>
//            <p>Likes: {videoData.likes}</p>
//            <p>Views: {videoData.views}</p>
//            <p>Duration: {videoData.duration}</p>
//          </div>
//        </div>
//
//  
//  
//      <div className="right">
//        <div className="round-number">Round {gamePhase}</div>
//        <div className="pot-amount">pot: {pot}</div>
//        <input
//          className="input-amount"
//          type="number"
//          placeholder="Enter amount..."
//          value={decisionAmount}
//          onChange={(event) => setDecisionAmount(event.target.value)}
//        />
//        <div className="button-container">
//          <button className="call-button" onClick={handleCall}>call</button>
//          <button className="raise-button" onClick={handleRaise}>raise</button>
//          <button className="left-button" onClick={handleLeaveGame}>leave</button>
//            <dialog open={ShowLeaveModal}>
//              <div className="modal">
//                <p>Are you sure you want to leave the game?</p>
//                <div className="button-container">
//                  <button className="confirm-button" onClick={handleConfirmLeave}>Yes</button>
//                  <button className="cancel-button" onClick={handleCancelLeave}>No</button>
//                </div>
//              </div>
//            </dialog>
//          <button className="help-button" onClick={handleHelpClick}>help</button>
//        </div>
//      </div>
//  
//      <div className="footer">
//      <div className="card-container">
//        {comments.map((comment, index) => (
//          <div className="card" key={index}>
//            <div className="card-top">
//              <span>{comment.first.author}</span>
//              <i className="fas fa-heart"></i>
//            </div>
//            <div className="card-main">
//              {comment.first.content}
//            </div>
//          </div>
//        ))}
//      </div>
//    </div>
//            
//        {/* end of game section */}
//        {gameEnd && <EndOfGame winner={winner} gamePhase={gamePhase} />}
//        
//    {/* Show how to play window when "help" button is clicked */}
//    {showHowToPlay && <HowToPlay handleClose={() => setShowHowToPlay(false)} />}
//    
//    {/* Show show down window when "show down" button is clicked */}
//    {showShowDown && <ShowDown handleClose={handleCloseShowDown} />}
//    </div>
//    </div>
//  );
//};
//
//export default TestGame;
//