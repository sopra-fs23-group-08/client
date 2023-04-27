import {AppBar, Button, Card, CardContent, Grid, Toolbar, Typography} from "@material-ui/core";
import {useEffect, useState} from "react";
import Stomp from "stompjs";
import {useHistory, useLocation, useParams} from "react-router-dom";
import SockJS from "sockjs-client";
import {api} from "../../helpers/api";
import PropTypes from "prop-types";
import {makeStyles} from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import GameSettings from "../ui/GameSettings";
import Player from "../../models/Player";
import SettingsData from "../../models/SettingsData";

const useStyles = makeStyles((theme) => ({
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
    // may need to move playerlist component into view component to access classes
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
    // TODO: add leave game button

    const classes = useStyles();
    const history = useHistory();
    const location = useLocation();
    const { gameId } = useParams();

    const [gameStarting, setGameStarting] = useState(false);
    const [user, setUser] = useState(location.state.user);
    const [players, setPlayers] = useState([]);

    // setting state variables
    const [isHost, setIsHost] = useState(false);

    const [language, setLanguage] = useState("en");
    const [playlistUrl, setPlaylistUrl] = useState("");
    const [balance, setBalance] = useState(3000);
    const [bigBlind, setBigBlind] = useState(100);
    const [smallBlind, setSmallBlind] = useState(50);
    const [stompClient, setStompClient] = useState(null);
    // subscribe to player-list updates
    const [playersSubscription, setPlayersSubscription] = useState(null);
    // subscribe to setting updates
    const [settingsSubscription, setSettingsSubscription] = useState(null);
    // subscribe to game started
    const [gameStartSubscription, setGameStartSubscription] = useState(null);

    // when component first mounts:
    // 1. create a new websocket connection
    // 2. subscribe to the /topic/games/{gameId}/players topic
    // 3. send a message to the /app/games/{gameId}/players app endpoint
    // subscription must be done first, to update the players list with own name
    useEffect(() => {
        // check if user is host -> able to modify settings
        const checkUserHost = async () => {
            const response = await api.get(`/games/${gameId}/host`);
            const host = new Player(response.data);
            if (host.token === user.token) {
                setIsHost(true);
            }
            else {
                setIsHost(false);
            }
        }
        checkUserHost();

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
                        setPlayers(JSON.parse(message.data));
                        console.log(message.data);
                    }
                ));
                setSettingsSubscription(
                    client.subscribe(
                    `/topic/games/${gameId}/settings`,
                    (message) => {
                        console.log(message.data)
                        const settingsData = new SettingsData(message.data)
                        setLanguage(settingsData.language)
                        setPlaylistUrl(settingsData.playlistUrl)
                        setBalance(settingsData.balance)
                        setBigBlind(settingsData.bigBlind)
                        setSmallBlind(settingsData.smallBlind)
                    }
                ));

                setGameStartSubscription(
                    client.subscribe(
                      `/topic/games/${gameId}/settings`,
                      (message) => {
                        console.log(message.data)
                        setGameStarting(true)
                        // eslint-disable-next-line no-restricted-globals
                        history.push(`/games/${gameId}`)
                      }
                    )
                  );
                  
                // ADD PLAYER TO GAME
                const username = user.username;
                const token = localStorage.getItem("token");
                const requestBody = JSON.stringify({username, token});
                try {
                    client.send(
                        `/app/games/${gameId}/players/join`,
                        {},
                        requestBody
                    )
                }
                catch (error) { // if joining fails - redirect back to home
                    alert(`Couldn't join the lobby: ${error.response.message}`)
                    history.push("/home");
                }
            });
        }
        connectSocket();

        // CLEANUP //
        return () => {
            if(gameStarting){
                gameStartSubscription.unsubscribe();
                settingsSubscription.unsubscribe();
                return
            }
            leaveGame()
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
                                 initialBalance={balance}
                                 bigBlind={bigBlind}
                                 smallBlind={smallBlind}
                                 playlist={playlistUrl}
                                 // setters
                                 onLanguageChange={l => setLanguage(l)}
                                 onInitialBalanceChange={b => setBalance(b)}
                                 onBigBlindChange={b => setBigBlind(b)}
                                 onSmallBlindChange={s => setSmallBlind(s)}
                                 onPlaylistChange={p => setPlaylistUrl(p)}
    />;


    useEffect(() => {
        settings = <GameSettings isHost={isHost}
                                // variables
                                 language={language}
                                 balance={balance}
                                 bigBlind={bigBlind}
                                 smallBlind={smallBlind}
                                 playlistUrl={playlistUrl}
                                // setters
                                 onLanguageChange={l => setLanguage(l)}
                                 onBalanceChange={b => setBalance(b)}
                                 onBigBlindChange={b => setBigBlind(b)}
                                 onSmallBlindChange={s => setSmallBlind(s)}
                                 onPlaylistUrlChange={p => setPlaylistUrl(p)}
        />
    }, [isHost, language, balance, bigBlind, smallBlind, playlistUrl])

    const startGame = () => {
        // prevent player being removed from game on unmount
        setGameStarting(true)

        // notify other players
        try {
            stompClient.send(`/games/${gameId}/start`, {})
        }
        catch (error) {
            const response = error.response

            if(response.status === 400) {
                alert(`Couldn't start the game: ${response.message}`)
            }
            else {
                console.log("Something went wrong while starting the game")
            }
        }

        // redirect
        history.push(`/games/${gameId}`)
    }

    const leaveGame = () => {
        // remove player from playerList & disconnect WS
        const destination = `/app/games/${gameId}/players/leave`
        const token = localStorage.getItem("token");
        const username = localStorage.getItem("username");
        const responseBody = JSON.stringify({ token, username });
        // TODO catch exceptions
        stompClient.send(destination, {}, responseBody);
        // unsub & disconnect
        gameStartSubscription.unsubscribe();
        settingsSubscription.unsubscribe();
        stompClient.disconnect();
    }

    return (
        <Grid container
              className={classes.root}
        >
            <Grid item>
                <Card className={classes.mainCard}>
                    <AppBar position={"relative"}>
                        <Toolbar className={classes.cardBar}>
                            <Typography className={classes.lobbyTitle}>
                                {user.username}'s lobby
                            </Typography>
                            <Button variant={"contained"}
                                    disabled={!isHost}
                                    onClick={startGame}
                            >
                                Start Game
                            </Button>
                            <Button variant={"contained"}
                                    disabled={!isHost}
                                    onClick={leaveGame}
                            >
                                Leave Game
                            </Button>
                            <Button className={classes.copyButton}
                                    color={"inherit"}
                                    variant={"outlined"}
                                    onClick={() => {navigator.clipboard.writeText(gameId);}}
                            >
                                Copy lobby id
                            </Button>
                            <IconButton>
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
        </Grid>
    )
}

export default Lobby;