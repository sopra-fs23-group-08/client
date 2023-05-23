import {AppBar, Button, Card, CardContent, Grid, Toolbar, Typography} from "@material-ui/core";
import {useContext, useEffect, useRef, useState} from "react";
import {useHistory, useParams} from "react-router-dom";
import {api} from "../../helpers/api";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import GameSettings from "../ui/GameSettings";
import Player from "../../models/Player";
import SettingsData from "../../models/SettingsData";
import { Spinner } from "../ui/Spinner";
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
    const gameStarting = useRef(false);
    const history = useHistory();
    const { gameId } = useParams();
    const classes = useStyles(); // material-ui

    /** Users/Host info */
    const { user } = useContext(UserContext);
    const [players, setPlayers] = useState([]);
    const [host, setHost] = useState(null);
    const isHost = useRef(false);

    /** Settings TODO: remove standard youtube URL --> account for absent/false input */
    const [language, setLanguage] = useState("ENGLISH");
    const [playlistUrl, setPlaylistUrl] = useState("https://www.youtube.com/watch?v=HnIdtbV_TDU&list=PLjT6ePOFLFf3gHO_fXXmikcipOV3ZLYB0");
    const [initialBalance, setInitialBalance] = useState("3000");
    const [bigBlind, setBigBlind] = useState("100");
    const [smallBlind, setSmallBlind] = useState("50");

    /** Websocket */
    const { stompClient } = useContext(StompContext);
    const { connect } = useContext(StompContext);
    const playersSubscription = useRef(null);
    const settingsSubscription = useRef(null);
    const gameStartSubscription = useRef(null);
    const gameCloseSubscription = useRef(null);

    /** Handler functions */
    const handlePlayerUpdate = (message) => {
        const playerArray = JSON.parse(message.body);
        // Only update the state if there are changes to the player list
        if (isMounted.current === true && JSON.stringify(playerArray) !== JSON.stringify(players)) {
            setPlayers(playerArray);
        }
    }
    const handleSettingsUpdate = (message) => {
        const settingsData = new SettingsData(JSON.parse(message.body))
        if(isMounted.current) {
            setLanguage(settingsData.language)
            setPlaylistUrl(settingsData.playlistUrl)
            setInitialBalance(settingsData.initialBalance.toString())
            setBigBlind(settingsData.bigBlind.toString())
            setSmallBlind(settingsData.smallBlind.toString())
        }
    }
    const handleRemoteStartGame = (message) => {
        console.log("Received start game message:", message.data);
        gameStarting.current = true;
        isMounted.current = false;
        history.push(`/games/${gameId}`);
    }

    const handleStartGame = () => {
        if(players.length < 2) {
            alert("You cannot play alone! :(")
            return;
        }
        gameStarting.current = true;
        handleSettingsSave().then(
            () => {
                stompClient.current.send(`/app/games/${gameId}/start`, {}, "start blease");
                isMounted.current = false;
                history.push(`/games/${gameId}`);
            }
        )
    };

    const handleLeaveGame = () => {
        // remove player from playerList & disconnect WS
        // should only be triggered by beforeUnload event OR cleanup, not both.
        const destination = `/app/games/${gameId}/players/remove`
        const token = user.token;
        const name = user.name;
        const requestBody = JSON.stringify({ name, token });
        stompClient.current.send(destination, {}, requestBody);
        if(isHost.current) {
            stompClient.current.send(`/app/games/${gameId}/close`, {}, "close blease");
        }
        history.push("/home");
    }

    const handleGameClosed = () => {
        if(!isHost.current) {
            alert("The host has left the game. You will be redirected to the homepage.");
            history.push("/home");
        }
    }

    function isPositiveInteger(n) {
        return n >>> 0 && parseInt(n);
    }

    const handleSettingsSave = async () => {
        const destination = `/app/games/${gameId}/settings`;
        if(!(isPositiveInteger(initialBalance) && isPositiveInteger(bigBlind) && isPositiveInteger(smallBlind))) {
            alert("The blinds and initial balance must be positive, whole numbers.");
            return;
        }
        // check if playlistUrl is a valid YouTube playlist
        if(playlistUrl) {
            try {
                await api.post(`/games/helpers/playlist`, { playlistUrl });
            }
            catch (error) {
                const response = error.response;
                if(response.status === 400) {
                    alert(`The Playlist you entered is invalid: ${response.data.message}`);
                }
                else {
                    alert(`Something unexpected went wrong while saving your settings: ${response.status}`);
                }
                return;
            }
        }

        const requestBody = JSON.stringify({
            language,
            playlistUrl,
            initialBalance,
            bigBlind,
            smallBlind
        });

        stompClient.current.send(destination, {}, requestBody);
    }

    /** ON MOUNT/DISMOUNT */
    //NOSONAR
    useEffect(() => {
        
        window.addEventListener("beforeunload", handleLeaveGame);

        // check if user is host -> able to modify settings
        const checkHost = async () => {
            // check if data is received/parsed correctly
            const response = await api.get(`/games/${gameId}/host`);
            const hostPlayer = new Player(response.data);
            setHost(hostPlayer);
            if (hostPlayer.token === user.token) {
                isHost.current = true;
            }
        }
        checkHost();

        // setup stomp client
        const connectSocket = async () => {
            const client = await connect();

            // SUBSCRIPTIONS //
            playersSubscription.current = client.subscribe(`/topic/games/${gameId}/players`, handlePlayerUpdate)

            if(!isHost.current) {
                settingsSubscription.current = client.subscribe(`/topic/games/${gameId}/settings`, handleSettingsUpdate)
                gameStartSubscription.current = client.subscribe(`/topic/games/${gameId}/start`, handleRemoteStartGame)
                gameCloseSubscription.current = client.subscribe(`/topic/games/${gameId}/close`, handleGameClosed)
                client.send(`/app/games/${gameId}/resendSettings`, {}, "gimme settings blease")
            }

            // TODO: catch errors somehow - WS errors are not propagated to the client yet
            const name = user.name;
            const token = user.token;
            const requestBody = JSON.stringify({name, token});
                client.send(
                `/app/games/${gameId}/players/add`,
                {},
                requestBody
                );
            }
        connectSocket();

        // CLEANUP //
        return () => {
            // unsubscribe from all subscriptions TODO check if I need to await the unsubscribe calls
            if(settingsSubscription.current) settingsSubscription.current.unsubscribe();
            if(playersSubscription.current) playersSubscription.current.unsubscribe();
            if(gameCloseSubscription.current) gameCloseSubscription.current.unsubscribe();
            if(gameStartSubscription.current) gameStartSubscription.current.unsubscribe();
            window.removeEventListener("beforeunload", handleLeaveGame);
            if(!gameStarting.current) handleLeaveGame();
        }
        //NOSONAR
    }, []);



    /** Realtime Components */
    let playerList = <PlayerList list={players}/>;

    let settings = <GameSettings isHost={isHost.current}
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

    let content = <Spinner/>

    if(host && stompClient.current) {
        content = <Grid item>
            <Card className={classes.mainCard}>
                <AppBar position={"relative"}>
                    <Toolbar className={classes.cardBar}>
                        <Typography className={classes.lobbyTitle}>
                            {host.name}'s lobby
                        </Typography>
                        <Button variant={"contained"}
                                disabled={!isHost.current || players.length < 2}
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
                                    onClick={() => history.push("/home")}
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

// TODO: debug warnings (e.g. input controller/uncontrolled)

export default Lobby;