import {Button, Card, CardActions, CardContent, Grid, TextField, Typography} from "@material-ui/core";
import {useEffect, useState} from "react";
import {getDomain} from "../../helpers/getDomain";
import Stomp from "stompjs";
import {useParams} from "react-router-dom";
import SockJS from "sockjs-client";
import {api} from "../../helpers/api";

const TestLobby = () => {
    const [players, setPlayers] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [username, setUsername] = useState("");

    const { gameId } = useParams();

    const PlayerList = () => {
        return (
            <Grid container
                  width={"100vw"}
                  height={"100vh"}
                  direction={"column"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  spacing={2}
            >
                {players.map((player) => {
                    return (
                        <Grid item>
                            <Card>
                                <CardContent>
                                    <Typography variant={"h6"}>
                                        {player}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )
                })}
            </Grid>
        )
    }

    const changeUsername = (event) => {
        setUsername(event.target.value)
    };

    const doSend = () => {
        stompClient.send(
            "/app/games/" + gameId + "/players",
            {},
            JSON.stringify({username})
        );
    }
    let content = <PlayerList/>;

    useEffect(() => {
        content = <PlayerList/>;
    }, [players])

    // when component first mounts:
    // 1. create a new websocket connection
    // 2. subscribe to the /topic/games/{gameId}/players topic
    // 3. send a message to the /app/games/{gameId}/players app endpoint
    useEffect(() => {
        let socket = new SockJS("http://localhost:8080/sopra-websocket");
        const client = Stomp.over(socket);
        setUsername("test");
        setStompClient(client);
        console.log("Connecting to websocket...");
        client.connect({}, () => {
            console.log("Connected to websocket");
            client.subscribe(
                `/topic/games/${gameId}/players`,
                (message) => {
                    console.log(`Message received: ${message.body}`);
                }
            );
            client.send(
                "/app/games/" + gameId + "/players",
                {},
                JSON.stringify({username})
            );
        });
    }, []);


    return (
        <Grid container
              width={"100vw"}
              height={"100vh"}
              direction={"column"}
        >
        <Typography variant={"h1"} color={"secondary"}>
            Test Lobby
        </Typography>
            <Grid item>
                <Card>
                    <CardContent>
                        {content}
                    </CardContent>
                    <CardActions>
                        <Button variant={"contained"} color={"primary"} onClick={doSend}>
                            send
                        </Button>
                        <TextField onChange={changeUsername}/>
                    </CardActions>
                </Card>
            </Grid>
        </Grid>
    )
}

export default TestLobby;