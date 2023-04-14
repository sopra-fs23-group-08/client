import {Button, Card, CardActions, CardContent, Grid, TextField, Typography} from "@material-ui/core";
import {useEffect, useState} from "react";
import {getDomain} from "../../helpers/getDomain";
import Stomp from "stompjs";
import {useParams} from "react-router-dom";
import SockJS from "sockjs-client";
import {api} from "../../helpers/api";
import PropTypes from "prop-types";

const TestLobby = () => {
    const [players, setPlayers] = useState([]);
    const [username, setUsername] = useState("test"+Math.floor(Math.random()*1000));
    const { gameId } = useParams();

    const [stompClient, setStompClient] = useState(null);
    // subscribe to player-list updates
    const [playersSubscription, setPlayersSubscription] = useState(null);
    // subscribe to setting updates
    const [settingsSubscription, setSettingsSubscription] = useState(null);

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
                {props.list.map((player) => {
                    return (
                        <Grid item key={players.indexOf(player)}>
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
    // TODO: for some reason the player list is not updated when the players change
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
                client.subscribe(
                    `/topic/games/${gameId}/players`,
                    (message) => {
                        setPlayers(JSON.parse(message.body));
                    }
                );
                client.send(
                    `/app/games/${gameId}/players`,
                    {},
                    JSON.stringify({username})
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