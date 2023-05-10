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
    const [playersSubscription, setPlayersSubscription] = useState(null);
    const [settingsSubscription, setSettingsSubscription] = useState(null);
    const [gameStartSubscription, setGameStartSubscription] = useState(null);

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
            setInitialBalance(settingsData.balance)
            setBigBlind(`${settingsData.bigBlind}`)
            setSmallBlind(`${settingsData.smallBlind}`)
        }
    }

    const handleRemoteStartGame = (message) => {
        console.log("Received start game message:", message.data);
        gameStarting.current = true;
        isMounted.current = false;
        history.push(`/games/${gameId}`);
    }


    const handleStartGame = () => {
        console.log("handleStartGame called");
        console.log("gameId:", gameId);
        gameStarting.current = true;

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

    /** ON MOUNT/DISMOUNT */
    useEffect(async () => {

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
        await checkHost();

        // setup stomp client
        const connectSocket = async () => {
            const client = await connect();
            // SUBSCRIPTIONS //
            setPlayersSubscription(
                client.subscribe(`/topic/games/${gameId}/players`, handlePlayerUpdate)
            )
            if(!isHost) {
                setSettingsSubscription(
                    client.subscribe(`/topic/games/${gameId}/settings`, handleSettingsUpdate)
                )
                setGameStartSubscription(
                    client.subscribe(`/topic/games/${gameId}/start`, handleRemoteStartGame)
                )
            }
            // ADD USER TO GAME TODO: catch errors somehow - errors are not propagated to the client yet
            const name = user.name;
            const token = localStorage.getItem("token");
            const requestBody = JSON.stringify({name, token});
            client.send(
                `/app/games/${gameId}/players/add`,
                {},
                requestBody
            );

        }
        await connectSocket();

        // CLEANUP //
        return async () => {
            // unsubscribe from all subscriptions
            if(settingsSubscription) await settingsSubscription.unsubscribe();
            if(playersSubscription) await playersSubscription.unsubscribe();
            if(gameStartSubscription) await gameStartSubscription.unsubscribe();
            if(!gameStarting.current) handleLeaveGame();
        }
    }, []);



    /** Realtime Components */
    let playerList = <PlayerList list={players}/>;
    // rerender PlayerList if players change
    useEffect(() => {
        playerList = <PlayerList list={players}/>;
    }, [players])

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

    // rerender GameSettings if settings change
    useEffect(() => {
        settings = <GameSettings isHost={isHost.current}
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
    }, [isHost.current, language, initialBalance, bigBlind, smallBlind, playlistUrl])

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
                                disabled={!isHost.current}
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

// TODO: debug warnings (e.g. input controller/uncontrolled)

export default Lobby;