import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Stomp from 'stompjs';
import 'styles/views/TestGame.scss';

import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  TextField,
  IconButton,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
import LeaveIcon from "@material-ui/icons/ExitToApp";
import HelpIcon from "@material-ui/icons/Help";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import HowToPlay from 'components/ui/HowToPlay';
import EndOfGame from 'components/ui/EndofGame';
import ShowDown from 'components/ui/ShowDown';


const Game = () => {
  const location = useLocation();
  const [stompClient, setStompClient] = useState(null);
  const [playerList, setPlayerList] = useState([]);
  const [gamePhase, setGamePhase] = useState(''); //?
  const [winner, setWinner] = useState(null); 
  const [EndOfGame, setEndOfGame] = useState(false);
  const [video, setVideo] = useState({});  //?
  const [pot, setPot] = useState(0);
  const [callAmount, setCallAmount] = useState(0);
  const [myHand, setMyHand] = useState([]);
  const [decision, setDecision] = useState('fold');//?
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showShowDown, setShowShowDown] = useState(false);
  const [comments, setComments] = useState([]);

  const [bigBlind, setBigBlind] = useState(0);
  const [smallBlind, setSmallBlind] = useState(0);

  const heartIcons = document.querySelectorAll('.card-top i');

  // define state variables for video data
  const [videoData, setVideoData] = useState({
    title: "",
    thumbnail: "",
    releaseDate: "",
    likes: "",
    length: "",
    views: ""
  });


  // initialize stomp client and subscribe to channels
  useEffect(() => {
    const gameId = location.pathname.split('/')[2];
    const socket = new WebSocket(`ws://${window.location.host}/game/${gameId}`);
    const stomp = Stomp.over(socket);

    setStompClient(stomp);

    // set up stomp.subscribe channels
    stomp.connect({}, () => {
          
      // video, subscribe: topic/games/{gameId}/state/video, to get video data
      stomp.subscribe(`/topic/games/${gameId}/state/video`, (message) => {
        const data = JSON.parse(message.body);
        setVideoData({
          title: data.title,
          thumbnail: data.thumbnail,
          releaseDate: data.releaseDate,
          likes: data.likes,
          length: data.length,
          views: data.views
        });
      });

      // general, subscribe: topic/games/{gameId}/state/general
      const subscription = stomp.subscribe(`/topic/games/${gameId}/state`, (message) => {
        const data = JSON.parse(message.body);
        setPot(data.potAmount);
        setRoundNumber(data.roundNumber);
        setPlayerList(data.players);
        setBigBlind(data.bigBlind);
        setSmallBlind(data.smallBlind);
        setCallAmount(data.callAmount);
        setGamePhase(data.gamePhase);
      });



      // subscribe to the comments for the local player's hand
      stompClient.connect({}, () => {
        stompClient.subscribe(`/topic/games/${props.gameId}/players/${props.userId}/hand`, (message) => {
          const commentsData = JSON.parse(message.body).map((comment) => {
            return {
              content: comment.content,
              author: comment.author,
              date: comment.date,
              likes: comment.likes,
              isMatched: comment.is_matched,
            };
          });
          setMyHand(commentsData);
        });
      });


        
      //players, subscribe: topic/games/{gameId}/players, to get all players' data
      stomp.subscribe(`/topic/games/${gameId}/players`, (message) => {
        const data = JSON.parse(message.body);
        const players = data.map(player => {
          const decision = player.lastDecision ? player.lastDecision.action : "No decision";
          const callAmount = player.lastDecision ? player.lastDecision.amount : "N/A";
          return {
            username: player.username,
            decision: player.lastDecision,
            callAmount: player.callAmount,
            score: player.score,
            token: player.token
          };
        });
        setPlayerList(players);
      });
      

      
      const videoSubscription = stompClient.subscribe(
        `/games/${gameId}/state/video`,
        (message) => {
          const videoData = JSON.parse(message.body);
          handleVideoUpdate(videoData);
        }
      );
      return () => {
        videoSubscription.unsubscribe();
      };
    }, [stompClient, location.pathname]);

   return () => {
      if (stomp) {
        stomp.disconnect();
      }
    };
  }, [location.pathname]);


       // update video
       const handleVideoUpdate = (message) => {
        const data = JSON.parse(message.body);
        setVideoData({
          title: data.title,
          thumbnail: data.thumbnail,
          releaseDate: data.releaseDate,
          likes: data.likes,
          length: data.length,
          views: data.views,
        });
      };
  
      // update general
      const handleGameStateUpdate = (message) => {
        const data = JSON.parse(message.body);
        setPlayerList(data.players);
        setPot(data.potAmount);
        setCallAmount(data.callAmount);
        setGamePhase(data.gamePhase);
      };
      
      // update players
      const handlePlayersUpdate = (message) => {
        const data = JSON.parse(message.body);
        const players = data.map((player) => ({
          username: player.username,
          token: player.token,
          score: player.score,
          lastDecision: player.lastDecision,
        }));
        setPlayerList(players);
      };
      
        
      // update hand
      const handleUpdateCommentCard = (message) => {
        const data = JSON.parse(message.body);
        const comment = data.comment;
        setComments(comments => {
          const index = comments.findIndex(c => c.id === comment.commentId);
          if (index >= 0) {
            return [
              ...comments.slice(0, index),
              {
                id: comment.commentId,
                author: comment.author,
                content: comment.content,
                likes: comment.likes,
                date: comment.date
              },
              ...comments.slice(index + 1)
            ];
          } else {
            return comments;
          }
        });
      };
    
      // notify players that a player has left the game
      useEffect(() => {
        const gameId = location.pathname.split('/')[2];
      
        // Subscribe to WebSocket messages on /topic/games/{gameId}/players
        stompClient.subscribe(`/topic/games/${gameId}/players`, (message) => {
          const updatedPlayerList = JSON.parse(message.body);
      
          // Update player list in front-end
          setPlayerList(updatedPlayerList);
      
          // Notify all remaining players that a player has left the game
          const leftPlayer = playerList.find((player) => !updatedPlayerList.some((updatedPlayer) => updatedPlayer.username === player.username));
          if (leftPlayer) {
            console.log(`${leftPlayer.username} has left the game`);
          }
        });
      
        // Unsubscribe from WebSocket messages when component unmounts
        return () => stompClient.unsubscribe(`/topic/games/${gameId}/players`);
      }, [stompClient, location.pathname, playerList]);



    // subscribe to the topic for updating comment cards
    useEffect(() => {
      stompClient.subscribe(`/app/games/${props.gameId}/players/${props.userId}/hand`, handleUpdateCommentCard);
      return () => {
        stompClient.unsubscribe(`/app/games/${props.gameId}/players/${props.userId}/hand`);
      };
    }, [props.gameId]);

      
      //decision button: raise, call
      //send to: games/game_id/players/player_id/decision
      //and then update to: games/game_id/state/general
      const handleDecisionSubmit = () => {
        const gameId = location.pathname.split('/')[2];
        let decisionValue;
        if (decision === 'raise') {
          decisionValue = parseInt(callAmount);
        } else if (decision === 'call') {
          decisionValue = callAmount;
        } else {
          decisionValue = 0;
        }
        const decisionData = {
          decision: decision,
          amount: decisionValue,
        };
        stompClient.send(`/app/games/${gameId}/players/${localStorage.getItem('userId')}/decision`, {}, JSON.stringify(decisionData));
      };
      
      // update the pot amount after each player's decision
      const handlePlayerDecisionChanged = (message) => {
        const data = JSON.parse(message.body);
        setPot(data.potAmount);
      };
      
      stomp.subscribe(`/topic/games/${gameId}/players/${localStorage.getItem('userId')}/decision`, handlePlayerDecisionChanged);
      
  
      // leave button
      // send to: games/game_id/players/player_id/leave ？？？
      const handleLeaveGame = () => {
        setShowLeaveModal(true);
      };

      const handleConfirmLeave = () => {
        const gameId = location.pathname.split('/')[2];
        const playerId = localStorage.getItem('userId');
        stompClient.send(`/app/games/${gameId}/players/remove`, {}, JSON.stringify({ username: username, token: token }));
        // Update player list in front-end
        setPlayerList((prevPlayerList) => prevPlayerList.filter((player) => player.username !== username));
        setShowLeaveModal(false);
        // redirect to home page
        window.location.href = '/home';
      };
    
      
      const handleCancelLeave = () => {
        setShowLeaveModal(false);
      };
  
      const handleHelpClick = () => {
        setShowHowToPlay(true);
      };

      const handleEndOfGame = (gameEndMessage) => {
        setWinner(gameEndMessage.winner);
        setGamePhase(gameEndMessage.gamePhase);
        setEndOfGame(true);
      };

      const handleShowShowDown = () => {
        setShowShowDown(true);
      };
      
      
      heartIcons.forEach((icon) => {
        icon.addEventListener('click', (event) => {
          event.target.classList.toggle('liked');
        });
      });
      
  return (
    <body>
      {showShowDown ? (
        <ShowDown />
      ) : (

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
          <button className="left-button" onClick={handleLeaveConfirmation}>
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
        {EndOfGame && <EndOfGame winner={winner} gamePhase={gamePhase} />}

        {/* Show confirmation window when "leave" button is clicked */}
        {showLeaveConfirmation && (
        <div>
          <p>Are you sure you want to leave the game?</p>
          <button onClick={handleLeaveGame}>Yes</button>
          <button onClick={() => setShowLeaveConfirmation(false)}>No</button>
        </div>
        )}
        
        {/* Show how to play window when "help" button is clicked */}
        {showHowToPlay && <HowToPlay handleClose={() => setShowHowToPlay(false)} />}

    </div>
        )}
    </body>
);
};

export default Game;
  
  