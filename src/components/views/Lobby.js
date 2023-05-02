import {AppBar, Button, Card, CardContent, Grid, Toolbar, Typography} from "@material-ui/core";
import {useContext, useEffect, useState} from "react";
import Stomp from "stompjs";
import {useHistory, useParams} from "react-router-dom";
import SockJS from "sockjs-client";
import {api} from "../../helpers/api";
import PropTypes from "prop-types";
import {makeStyles} from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import GameSettings from "../ui/GameSettings";
import Player from "../../models/Player";
import SettingsData from "../../models/SettingsData";
import {Spinner} from "../ui/Spinner";
import UserContext from "../contexts/UserContext";
import StompContext from "../contexts/StompContext";

const useStyles = makeStyles(() => ({
    root: {
        height: '100vh',
        direction: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    mainCard: {
        width: '80vw',
        height: '80vh',
    },
    cardBar: {
        alignContent: 'center',
        justifyContent: 'space-between',
        height: '20%'
    },
    lobbyTitle: {
        variant: 'h4',
        color: 'inherit'
    },
    copyButton: {
        variant: "outlined",
        color: "secondary"
    },
    cardContainer: {
        // this probably needs changing
        height: '80%',
        width: '100%',
        direction: "row",
        alignItems: 'center',
        justifyContent:'space-around'
    },
    // may need to move playerList component into view component to access classes
    playerListContainer: {
        width: "100%",
        height: "100%",
        direction: "column",
        justifyContent: "center",
        alignItems: "center",
        spacing: 2
    },
    playerCard: {

    },
    settings: {

    }
}));

const PlayerList = (props) => {

    return (
        <Grid container
              width={"30%"}
              height={"100%"}
              direction={"column"}
              justifyContent={"center"}
              alignItems={"center"}
              spacing={2}
        >
            {props.list.map((player, index) => {
                return (
                    <Grid item key={index}>
                        <Card>
                            <CardContent>
                                <Typography variant={"h6"}>
                                    {player.username}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )
            })}
        </Grid>
    )
}

PlayerList.propTypes = {
    list: PropTypes.array
}

const Lobby = () => {
    // maybe start using contexts to pass state
    // TODO: disconnect from WS endpoint on unmount and send leave game message to WS endpoint
    // TODO: implement a context for the stompClient & subscriptions
    const classes = useStyles(); // material-ui
    const history = useHistory();
    const { gameId } = useParams();
    const { user } = useContext(UserContext);
    const { stompClient } = useContext(StompContext);
    const { setStompClient } = useContext(StompContext);
    const { connect } = useContext(StompContext);

    const [gameStarting, setGameStarting] = useState(false);
    const [players, setPlayers] = useState([]);

    // host information
    const [host, setHost] = useState(null);
    const [isHost, setIsHost] = useState(false);

    const [language, setLanguage] = useState("en");
    const [playlistUrl, setPlaylistUrl] = useState("");
    const [initialBalance, setInitialBalance] = useState("3000");
    const [bigBlind, setBigBlind] = useState("100");
    const [smallBlind, setSmallBlind] = useState("50");
    // subscribe to player-list updates
    const [playersSubscription, setPlayersSubscription] = useState(null);
    // subscribe to setting updates
    const [settingsSubscription, setSettingsSubscription] = useState(null);
    // subscribe to game started
    const [gameStartSubscription, setGameStartSubscription] = useState(null);

    const createStompClient = async () => {
        const stompClient = await connect();
        return stompClient;
    }
    
    const handlePlayerUpdate = (message) => {
        const playerArray = JSON.parse(message.body);
        console.log("Received player list:", playerArray);
        // Only update the state if there are changes to the player list
        if (JSON.stringify(playerArray) !== JSON.stringify(players)) {
            setPlayers(playerArray);
        }
    }      
    const handleSettingsUpdate = (message) => {
        console.log(message.data)
        const settingsData = new SettingsData(message.data)
        setLanguage(settingsData.language)
        setPlaylistUrl(settingsData.playlistUrl)
        setInitialBalance(settingsData.balance)
        setBigBlind(settingsData.bigBlind)
        setSmallBlind(settingsData.smallBlind)
    }
    const handleRemoteStartGame = (message) => {
        console.log("Received start game message:", message.data);
        setGameStarting(true);
        history.push(`/games/${gameId}`);
    }
    

    const handleStartGame = () => {
        console.log("handleStartGame called");
        console.log("gameId:", gameId);
        setGameStarting(true);
        stompClient.send(`/app/games/${gameId}/start`, {}, () => {
          console.log("Sent start game message");
        }, (error) => {
          console.error("Error sending start game message:", error);
        });
        history.push(`/games/${gameId}`);
      };
      

    const handleLeaveGame = () => {
        // remove player from playerList & disconnect WS
        const destination = `/app/games/${gameId}/players/leave`
        const token = localStorage.getItem("token");
        const name = localStorage.getItem("name");
        const requestBody = JSON.stringify({ name, token });
        // TODO catch exceptions somehow
        stompClient.send(destination, {}, requestBody);
        // unsub & disconnect
        if(settingsSubscription) settingsSubscription.unsubscribe();
        if(playersSubscription) playersSubscription.unsubscribe();
        if(gameStartSubscription) gameStartSubscription.unsubscribe();
        stompClient.disconnect();
        history.push("/home");
    }
      

    /** ON MOUNT */
    useEffect(() => {
        
        // check if user is host -> able to modify settings
        const checkHost = async () => {
            const response = await api.get(`/games/${gameId}/host`);
            const hostPlayer = new Player(response.data);
            setHost(hostPlayer);
            if (hostPlayer.token === user.token) {
                setIsHost(true);
            }
        }
        checkHost();

        // setup stomp client
        const connectSocket = async () => {
            const stompClient = await createStompClient();
                setStompClient(stompClient);
                console.log("Connected to STOMP server");
                // SUBSCRIPTIONS //
                setPlayersSubscription(
                    stompClient.subscribe(`/topic/games/${gameId}/players`, handlePlayerUpdate)
                )
                setSettingsSubscription(
                    stompClient.subscribe(`/topic/games/${gameId}/settings`, handleSettingsUpdate)
                )
                setGameStartSubscription(
                    stompClient.subscribe(`/topic/games/${gameId}/start`, handleRemoteStartGame)
                )
                // ADD PLAYER TO GAME
                const name = user.name;
                const token = localStorage.getItem("token");
                const requestBody = JSON.stringify({name, token});
                // TODO catch errors somehow - try/catch doesn't work because WS
                stompClient.send(
                        `/app/games/${gameId}/players/add`,
                        {},
                        requestBody
                );
        }
        connectSocket();


        // CLEANUP //
        return () => {
            if (stompClient) {
                if (gameStartSubscription) gameStartSubscription.unsubscribe();
                if (settingsSubscription) settingsSubscription.unsubscribe();
                if (playersSubscription) playersSubscription.unsubscribe();
            }
            handleLeaveGame();
            if (stompClient) stompClient.disconnect();
        }
    }, []);

        

    /** Dynamic Components */
    let playerList = <PlayerList list={players}/>;
    // rerender PlayerList if players change
    useEffect(() => {
        playerList = <PlayerList list={players}/>;
    }, [players])

    let settings = <GameSettings isHost={isHost}
                                 // variables
                                 language={language}
                                 balance={initialBalance}
                                 bigBlind={bigBlind}
                                 smallBlind={smallBlind}
                                 playlistUrl={playlistUrl}
                                 // setters
                                 onLanguageChange={l => setLanguage(l)}
                                 onBalanceChange={b => setInitialBalance(b)}
                                 onBigBlindChange={b => setBigBlind(b)}
                                 onSmallBlindChange={s => setSmallBlind(s)}
                                 onPlaylistUrlChange={p => setPlaylistUrl(p)}
    />;


    useEffect(() => {
        settings = <GameSettings isHost={isHost}
                                // variables
                                 language={language}
                                 balance={initialBalance}
                                 bigBlind={bigBlind}
                                 smallBlind={smallBlind}
                                 playlistUrl={playlistUrl}
                                // setters
                                 onLanguageChange={l => setLanguage(l)}
                                 onBalanceChange={b => setInitialBalance(b)}
                                 onBigBlindChange={b => setBigBlind(b)}
                                 onSmallBlindChange={s => setSmallBlind(s)}
                                 onPlaylistUrlChange={p => setPlaylistUrl(p)}
        />
    }, [isHost, language, initialBalance, bigBlind, smallBlind, playlistUrl])

    let content = <Spinner/>

    if(host && stompClient) {
        content = <Grid item>
            <Card className={classes.mainCard}>
                <AppBar position={"relative"}>
                    <Toolbar className={classes.cardBar}>
                        <Typography className={classes.lobbyTitle}>
                            {host.name}'s lobby
                        </Typography>
                        <Button variant={"contained"}
                                disabled={!isHost}
                                onClick={handleStartGame}
                        >
                            Start Game
                        </Button>
                        <Button className={classes.copyButton}
                                color={"inherit"}
                                variant={"outlined"}
                                onClick={() => {navigator.clipboard.writeText(gameId);}}
                        >
                            Copy lobby id
                        </Button>
                        <IconButton color={"inherit"}
                                    onClick={handleLeaveGame}
                        >
                            <ExitToAppIcon/>
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Grid container className={classes.cardContainer}>
                    <Grid item>
                        {playerList}
                    </Grid>
                    <Grid item>
                        {settings}
                    </Grid>
                </Grid>
            </Card>
        </Grid>
    }


    return (
        <Grid container
              className={classes.root}
        >
            {content}
        </Grid>
    )
}

export default Lobby;