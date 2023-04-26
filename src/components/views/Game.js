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



const Game = () => {
  const location = useLocation();
  const [stompClient, setStompClient] = useState(null);
  const [gamePhase, setGamePhase] = useState(null);
  const [playerList, setPlayerList] = useState([]);
  const [video, setVideo] = useState({});  //?
  const [pot, setPot] = useState(0);
  const [callAmount, setCallAmount] = useState(0);
  const [myHand, setMyHand] = useState([]);
  const [decision, setDecision] = useState('fold');//?
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showEndOfGame, setEndOfGame] = useState(false);
  const [showShowDown, setShowShowDown] = useState(false);
  const [comments, setComments] = useState([]);

  const [bigBlind, setBigBlind] = useState(0);
  const [smallBlind, setSmallBlind] = useState(0);

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
      stomp.subscribe(`/topic/games/${gameId}/state/general`, (message) => {
        const data = JSON.parse(message.body);
        setPlayerList(data.players);
        setBigBlind(data.bigBlind);
        setSmallBlind(data.smallBlind);
        setCallAmount(data.callAmount);
        setPot(data.potAmount);
        setGamePhase(data.gamePhase);
      });

     // hand, subscribe: topic/games/{gameId}/players/{userId}/hand, to get comments data
     stomp.subscribe(`/topic/games/${gameId}/players/${localStorage.getItem('userId')}/hand`, (message) => {
      const data = JSON.parse(message.body);
      const comments = data.comments.map(comment => ({
        content: comment.content,
        author: comment.author,
        date: comment.date,
        likes: comment.likes,
        is_matched: comment.is_matched,
      }));
      setMyHand(comments);
    });

      //players, subscribe: topic/games/{gameId}/players, to get all players' data
      stomp.subscribe(`/topic/games/${gameId}/players`, (message) => {
        const data = JSON.parse(message.body);
        const players = data.map(player => {
          return {
            username: player.username,
            decision: player.decision,
            callAmount: player.callAmount
          }
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
        const playerData = data.reduce((obj, item) => {
          obj[item.username] = item.lastDecision;
          return obj;
        }, {});
        setPlayerList(playerData);
      };
        
      // update hand
      const handleHandUpdate = (message) => {
        const data = JSON.parse(message.body);
        const commentsData = data.comments.map((comment) => {
          return {
            content: comment.content,
            author: comment.author,
            date: comment.date,
            likes: comment.likes,
            isMatched: comment.isMatched,
          };
        });
        setComments(commentsData);
      };

      
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
      
  
      // leave button
      // send to: games/game_id/players/player_id/leave ？？？
      const handleLeaveGame = () => {
        const gameId = location.pathname.split('/')[2];
        stompClient.send(`/app/games/${gameId}/players/${localStorage.getItem('userId')}/leave`, {}, '');
      };
  
  
      const handleHowToPlayClick = () => {
        setShowHowToPlay(true);
      };
      
  return (
    <body>
      <div className="box">
        <div className="left">
          <ul className="player-list">
            <li>
              <a href="/users/user1">PlayerUsername</a>
              Called 100 points, has 1000 points now
            </li>
            <li>
              <a href="/users/user2">PlayerUsername</a>
              Called 100 points, has 1000 points now
            </li>
            <li>
              <a href="/users/user3">PlayerUsername</a>
              Called 100 points, has 1000 points now
            </li>
            <li>
              <a href="/users/user4">PlayerUsername</a>
              Called 100 points, has 1000 points now
            </li>
            <li>
              <a href="/users/user5">PlayerUsername</a>
              Called 100 points, has 1000 points now
            </li>
            <li>
              <a href="/users/user6">PlayerUsername</a>
              Called 100 points, has 1000 points now
            </li>
            <li>
              <a href="/users/user7">PlayerUsername</a>
              Called 100 points, has 1000 points now
            </li>
          </ul> 
        </div>
  
        <div className="center">
          <div className="title">
            Title of the Video
          </div>
          <div className="video-container">
            <div className="thumbnail"></div>
          </div>
          <div className="stats">
            <p>Date: 2022.04.31</p>
            <p>Likes: 30348834</p>
            <p>Views: 2348230503</p>
          </div>
        </div>
  
  
      <div className="right">
        <div className="round-number">Round 4</div>
        <div className="pot-amount">pot: 13000</div>
        <div className="input-amount">
          <input type="text" placeholder="Amount" />
        </div>
        <div className="button-container">
          <button className="call-button">call</button>
          <button className="raise-button">raise</button>
          <button className="left-button">leave</button>
          <button className="help-button">help</button>
        </div>
      </div>
  
        <div className="footer">
          <div className="card-container">
            <div className="card">
              <div className="card-top">
                <span>MyUsername</span>
                <i className="fas fa-heart"></i>
              </div>
              <div className="card-main">
                This is comment content. This is comment content. This is comment content.
              </div>
            </div>
            <div className="card">
              <div className="card-top">
                <span>MyUsername</span>
                <i className="fas fa-heart"></i>
              </div>
              <div className="card-main">
                This is comment content. This is comment content. This is comment content.
              </div>
            </div>
            <div className="card">
              <div className="card-top">
                <span>MyUsername</span>
                <i className="fas fa-heart"></i>
              </div>
              <div className="card-main">
                This is comment content. This is comment content. This is comment content.
              </div>
            </div>
            <div className="card">
              <div className="card-top">
                <span>MyUsername</span>
                <i className="fas fa-heart"></i>
              </div>
              <div className="card-main">
                This is comment content. This is comment content. This is comment content.
              </div>
            </div>
            <div className="card">
              <div className="card-top">
                <span>MyUsername</span>
                <i className="fas fa-heart"></i>
              </div>
              <div className="card-main">
                This is comment content. This is comment content. This is comment content.
              </div>
            </div>
            <div className="card">
              <div className="card-top">
                <span>MyUsername</span>
                <i className="fas fa-heart"></i>
              </div>
              <div className="card-main">
                This is comment content. This is comment content. This is comment content.
              </div>
            </div>
            <div className="card">
              <div className="card-top">
                <span>MyUsername</span>
                <i className="fas fa-heart"></i>
              </div>
              <div className="card-main">
                This is comment content. This is comment content. This is comment content.
              </div>
            </div>
          </div>
        </div>
  
      </div>
    </body>
);
};

export default Game;
  
  