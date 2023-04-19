import {Button, Card, CardActions, CardContent, Grid, TextField, Typography} from "@material-ui/core";
import {useEffect, useState} from "react";
import {getDomain} from "../../helpers/getDomain";
import Stomp from "stompjs";
import {useLocation, useParams} from "react-router-dom";
import SockJS from "sockjs-client";
import {api} from "../../helpers/api";
import PropTypes from "prop-types";

const PlayerList = (props) => {

    return (
        <Grid container
              width={"100vw"}
              height={"100vh"}
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
    // TODO: Send user to WS endpoint on initial mount to update user list
    // TODO: Refactor the code receiving the player list from the WS endpoint; now receives a list of DTOs, not strings
    // TODO: enjoy a working lobby? for the love of god, please work this time :(
    // TODO: disconnect from WS endpoint on unmount and send disconnect message to WS endpoint
    const location = useLocation();
    const [user, setUser] = useState(location.state.user);
    const [players, setPlayers] = useState([]);
    const { gameId } = useParams();

    const [stompClient, setStompClient] = useState(null);
    // subscribe to player-list updates
    const [playersSubscription, setPlayersSubscription] = useState(null);
    // subscribe to setting updates
    const [settingsSubscription, setSettingsSubscription] = useState(null);

    // re-render PlayersList when players change
    let content = <PlayerList list={players}/>;

    useEffect(() => {
        content = <PlayerList list={players}/>;
    }, [players])

    // when component first mounts:
    // 1. create a new websocket connection
    // 2. subscribe to the /topic/games/{gameId}/players topic
    // 3. send a message to the /app/games/{gameId}/players app endpoint
    // subscription must be done first, to update the players list with own name
    useEffect(() => {
        async function connectSocket() {
            let socket = new SockJS("http://localhost:8080/sopra-websocket");
            const client = Stomp.over(socket);
            setStompClient(client);

            client.connect({}, () => {
                console.log("connected to websocket");
                client.subscribe(
                    `/topic/games/${gameId}/players`,
                    (message) => {
                        setPlayers(JSON.parse(message.body));
                        console.log(message.body);
                    }
                );
                const username = user.username;
                const score = 0;
                const token = localStorage.getItem("token");
                const requestBody = JSON.stringify({username, score, token});
                client.send(
                    `/app/games/${gameId}/players`,
                    {},
                    requestBody
                )
            });
        }
        connectSocket();
    }, []);


    return (
        <Grid container
              width={"100vw"}
              height={"100vh"}
              direction={"column"}
              alignItems={"center"}
        >
        <Typography variant={"h1"} color={"secondary"}>
            Test Lobby
        </Typography>
            <Grid item>
                <Card>
                    <CardContent>
                        {content}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}

export default TestLobby;