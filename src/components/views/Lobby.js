import {AppBar, Button, Card, CardContent, Grid, Toolbar, Typography} from "@material-ui/core";
import {useContext, useEffect, useRef, useState} from "react";
import {useHistory, useParams} from "react-router-dom";
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

    /** View info */
    const isMounted = useRef(true); // flag to avoid state updates after unmount
    const classes = useStyles(); // material-ui
    const history = useHistory();
    const { gameId } = useParams();
    const [gameStarting, setGameStarting] = useState(false);

    /** Users/Host info */
    const { user } = useContext(UserContext);
    const [players, setPlayers] = useState([]);
    const [host, setHost] = useState(null);
    const [isHost, setIsHost] = useState(false);

    /** Settings */
    const [language, setLanguage] = useState("en");
    const [playlistUrl, setPlaylistUrl] = useState("");
    const [initialBalance, setInitialBalance] = useState("3000");
    const [bigBlind, setBigBlind] = useState("100");
    const [smallBlind, setSmallBlind] = useState("50");

    /** Websocket */
    const { stompClient } = useContext(StompContext);
    const { setStompClient } = useContext(StompContext);
    const { connect } = useContext(StompContext);
    const [playersSubscription, setPlayersSubscription] = useState(null);
    const [settingsSubscription, setSettingsSubscription] = useState(null);
    const [gameStartSubscription, setGameStartSubscription] = useState(null);

    /** Handler functions */
    const createStompClient = async () => {
        const stompClient = await connect();
        return stompClient;
    }

    const handlePlayerUpdate = (message) => {
        const playerArray = JSON.parse(message.body);
        console.log("Received player list:", playerArray);
        // Only update the state if there are changes to the player list
        if (isMounted.current === true && JSON.stringify(playerArray) !== JSON.stringify(players)) {
            setPlayers(playerArray);
        }
    }
    const handleSettingsUpdate = (message) => {
        console.log(message.data)
        const settingsData = new SettingsData(message.data)
        if(isMounted) {
            setLanguage(settingsData.language)
            setPlaylistUrl(settingsData.playlistUrl)
            setInitialBalance(settingsData.balance)
            setBigBlind(settingsData.bigBlind)
            setSmallBlind(settingsData.smallBlind)
        }
    }

    const handleRemoteStartGame = (message) => {
        console.log("Received start game message:", message.data);
        if (isMounted.current === true) {
            setGameStarting(true);
        }
        isMounted.current = false;
        history.push(`/games/${gameId}`);
    }
    

    const handleStartGame = () => {
        console.log("handleStartGame called");
        console.log("gameId:", gameId);
        if(isMounted.current === true) {
            setGameStarting(true);
        }
        stompClient.send(`/app/games/${gameId}/start`, {}, "start blease");
        isMounted.current = false;
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
        history.push("/home");
    }

    const handleSettingsSave = () => {
        const destination = `/app/games/${gameId}/settings`;
        const requestBody = JSON.stringify({
            language,
            playlistUrl,
            initialBalance,
            bigBlind,
            smallBlind
        });
        stompClient.send(destination, {}, requestBody);
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
            const client = await createStompClient();
                setStompClient(client);
                console.log("Connected to STOMP server");
                // SUBSCRIPTIONS //
                setPlayersSubscription(
                    client.subscribe(`/topic/games/${gameId}/players`, handlePlayerUpdate)
                )
                setSettingsSubscription(
                    client.subscribe(`/topic/games/${gameId}/settings`, handleSettingsUpdate)
                )
                setGameStartSubscription(
                    client.subscribe(`/topic/games/${gameId}/start`, handleRemoteStartGame)
                )
                // ADD PLAYER TO GAME
                const name = user.name;
                const token = localStorage.getItem("token");
                const requestBody = JSON.stringify({name, token});
                // TODO catch errors somehow - try/catch doesn't work because WS
                client.send(
                        `/app/games/${gameId}/players/add`,
                        {},
                        requestBody
                );
                
        }
        connectSocket();
        if (stompClient) {
            console.log("there is a stompClient");
        }


        // CLEANUP //
        return async () => {
            // unsubscribe from all subscriptions
            if(settingsSubscription) await settingsSubscription.unsubscribe();
            if(playersSubscription) await playersSubscription.unsubscribe();
            if(gameStartSubscription) await gameStartSubscription.unsubscribe();
            if(!gameStarting) handleLeaveGame();
        }
    }, []);

        

    /** Realtime Components */
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
                                 onLanguageChange={setLanguage}
                                 onBalanceChange={setInitialBalance}
                                 onBigBlindChange={setBigBlind}
                                 onSmallBlindChange={setSmallBlind}
                                 onPlaylistUrlChange={setPlaylistUrl}
                                 onSaveSettings={handleSettingsSave}
    />;

    // rerender GameSettings if settings change
    useEffect(() => {
        settings = <GameSettings isHost={isHost}
                                // variables
                                 language={language}
                                 balance={initialBalance}
                                 bigBlind={bigBlind}
                                 smallBlind={smallBlind}
                                 playlistUrl={playlistUrl}
                                // setters
                                 onLanguageChange={setLanguage}
                                 onBalanceChange={setInitialBalance}
                                 onBigBlindChange={setBigBlind}
                                 onSmallBlindChange={setSmallBlind}
                                 onPlaylistUrlChange={setPlaylistUrl}
                                 onSaveSettings={handleSettingsSave}
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