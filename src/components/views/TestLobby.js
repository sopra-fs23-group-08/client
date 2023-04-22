import {AppBar, Button, Card, CardActions, CardContent, Grid, TextField, Toolbar, Typography} from "@material-ui/core";
import {useEffect, useState} from "react";
import {getDomain} from "../../helpers/getDomain";
import Stomp from "stompjs";
import {useLocation, useParams} from "react-router-dom";
import SockJS from "sockjs-client";
import {api} from "../../helpers/api";
import PropTypes from "prop-types";
import {makeStyles} from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import GameSettings from "../ui/GameSettings";
import User from "../../models/User";
import Player from "../../models/Player";

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

const TestLobby = () => {
    // GuestUser is created in GuestHomepage, and passed to this component via the location state
    // "normal" users are also passed as location state, but they are only retrieved from the backend
    // TODO: disconnect from WS endpoint on unmount and send leave game message to WS endpoint
    // TODO: add leave game button
    // TODO: add start game button
    // TODO: add settings subscription & callback

    const classes = useStyles();
    const location = useLocation();
    const [user, setUser] = useState(location.state.user);
    const [players, setPlayers] = useState([]);
    const { gameId } = useParams();

    // setting state variables
    const [isHost, setIsHost] = useState(false);
    const [language, setLanguage] = useState("en");
    const [playlist, setPlaylist] = useState("");
    const [balance, setBalance] = useState(3000);
    const [bigBlind, setBigBlind] = useState(100);
    const [smallBlind, setSmallBlind] = useState(50);

    const [stompClient, setStompClient] = useState(null);
    // subscribe to player-list updates
    const [playersSubscription, setPlayersSubscription] = useState(null);
    // subscribe to setting updates
    const [settingsSubscription, setSettingsSubscription] = useState(null);


    // when component first mounts:
    // 1. create a new websocket connection
    // 2. subscribe to the /topic/games/{gameId}/players topic
    // 3. send a message to the /app/games/{gameId}/players app endpoint
    // subscription must be done first, to update the players list with own name
    useEffect(() => {
        // TODO check if this works
        // check if player is the host (via get request so it can be changed)
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
        async function connectSocket() {
            let socket = new SockJS("http://localhost:8080/sopra-websocket");
            const client = Stomp.over(socket);
            setStompClient(client);

            client.connect({}, () => {
                console.log("connected to websocket");
                setPlayersSubscription(client.subscribe(
                    `/topic/games/${gameId}/players`,
                    (message) => {
                        setPlayers(JSON.parse(message.body));
                        console.log(message.body);
                    }
                ));
                const username = user.username;
                const score = 0;
                const token = localStorage.getItem("token");
                const requestBody = JSON.stringify({username, score, token});
                // check if user is already in game is done in BE
                client.send(
                    `/app/games/${gameId}/players`,
                    {},
                    requestBody
                )
            });
        }
        connectSocket();
    }, []);


    let playerList = <PlayerList list={players}/>;
    // re-render PlayersList when players change
    useEffect(() => {
        playerList = <PlayerList list={players}/>;
    }, [players])



    let settings = <GameSettings isHost={isHost}
                                 // variables
                                 language={language}
                                 initialBalance={balance}
                                 bigBlind={bigBlind}
                                 smallBlind={smallBlind}
                                 playlist={playlist}
                                 // setters
                                 onLanguageChange={l => setLanguage(l)}
                                 onInitialBalanceChange={b => setBalance(b)}
                                 onBigBlindChange={b => setBigBlind(b)}
                                 onSmallBlindChange={s => setSmallBlind(s)}
                                 onPlaylistChange={p => setPlaylist(p)}/>;


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
                    <Button>
                        Start Game
                    </Button>
                </Card>
            </Grid>
        </Grid>
    )
}

export default TestLobby;