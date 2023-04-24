
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Stomp from 'stompjs';

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
import HowToPlay from 'components/ui/HowToPlay';
import EndOfGame from 'components/ui/EndofGame';

// styles
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  card: {
    margin: theme.spacing(1),
    textAlign: "center",
  },
  video: {
    backgroundColor: "red",
    width: "100%",
    height: "0",
    paddingBottom: "56.25%", // 16:9 aspect ratio
    position: "relative",
    overflow: "hidden",
  },
  thumbnail: {
    position: "absolute",
    width: "100%",
    height: "100%",
    left: "0",
    top: "0",
  },
  playerButton: {
    width: "100%",
    marginBottom: theme.spacing(1),
  },
  callButton: {
    marginTop: theme.spacing(2),
    width: "100%",
  },
  raiseButton: {
    marginTop: theme.spacing(1),
    width: "100%",
  },
}));


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

  const [bigBlind, setBigBlind] = useState(0);
  const [smallBlind, setSmallBlind] = useState(0);

  const classes = useStyles();

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
      

    return () => {
      if (stomp) {
        stomp.disconnect();
      }
    };
  }, [location.pathname]);


    return (
      <div className={classes.root}>
        <Grid container spacing={1}>
          {/* Player list */}
          <Grid item xs={2}>
            <Card className={classes.card}>
              <CardContent>
                {playerList.map((player, index) => (
                  <Button
                    key={index}
                    className={classes.playerButton}
                    variant="contained"
                    color="primary"
                  >
                    <Typography variant="subtitle1">{player.username}</Typography>
                    <Typography variant="body2">
                      {player.decision} {player.callAmount}
                    </Typography>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </Grid>
    
          {/* Video */}
          <Grid item xs={8}>
            <Card className={classes.card}>
              <CardContent>
                <div className={classes.video}>
                  <img
                    className={classes.thumbnail}
                    src={video.thumbnail}
                    alt="Video thumbnail"
                  />
                </div>
                <Typography variant="h6">{video.title}</Typography>
                <Typography variant="caption">
                  {video.releaseDate} &#8226; {video.likes} likes &#8226; {video.views} views
                </Typography>
                <div>
                  <progress value="0" max={video.length}></progress>
                </div>
                <Button variant="contained" color="primary" startIcon={<PlayArrowIcon />}>
                  Play
                </Button>
              </CardContent>
            </Card>
          </Grid>
    
          {/* My hand */}
          <Grid item xs={12}>
            <Card className={classes.card}>
              <CardContent>
                <Grid container spacing={1}>
                  {myHand.map((comment, index) => (
                    <Grid key={index} item xs={3}>
                      <Card>
                        <CardContent>
                          <Typography variant="body2">{comment.content}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
    
          {/* Game info */}
          <Grid item xs={2}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h6">Round {gamePhase}</Typography>
                <Typography variant="h5">Pot: {pot}</Typography>
                <Typography variant="h6">Amount:</Typography>
                <TextField
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={callAmount}
                  onChange={(e) => setCallAmount(e.target.value)}
                />
                <Button
                  className={classes.callButton}
                  variant="contained"
                  color="primary"
                  onClick={handleDecisionSubmit}
                >
                  Call
                </Button>
                <Button
                  className={classes.raiseButton}
                  variant="contained"
                  color="secondary"
                  onClick={handleDecisionSubmit}
                >
                  Raise
                </Button>
              </CardContent>
              <CardActions>
                <IconButton onClick={handleLeaveGame}>
                  <LeaveIcon />
                </IconButton>
                <IconButton onClick={handleHowToPlayClick}>
                  <HelpIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </div>
    );
  };

export default Game;

