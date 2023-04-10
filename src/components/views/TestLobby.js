import {Button, Card, CardActions, CardContent, Grid, Typography} from "@material-ui/core";
import {useEffect, useState} from "react";
import {getDomain} from "../../helpers/getDomain";
import Stomp from "stompjs";
import {useParams} from "react-router-dom";
import SockJS from "sockjs-client";

const TestLobby = () => {
    const [players, setPlayers] = useState([]);
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

    const [stompClient, setStompClient] = useState(null);
    useEffect(() => {
        let socket = new SockJS("http://localhost:8080/sopra-websocket");
        const client = Stomp.over(socket);
        console.log("Connecting to websocket...")
            client.connect({}, (frame) => {
                console.log("Connected to websocket");
                client.subscribe(`/topic/games/${gameId}/players`, (message) => {
                    console.log(`Client subscribed: ${message.body}`);
            })
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
                        <PlayerList/>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    )
}

export default TestLobby;