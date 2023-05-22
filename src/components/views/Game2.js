import {useContext, useEffect, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import StompContext from "../contexts/StompContext";
import Player from "../../models/Player";
import UserContext from "../contexts/UserContext";
import PlayerButtons from "../ui/PlayerButtons";
import {Spinner} from "../ui/Spinner";
import BaseContainer from "../ui/BaseContainer";
import "styles/views/Game2.scss";
import ScoreBoard from "../ui/ScoreBoard";
import VideoDisplay from "../ui/VideoDisplay";
import PlayerHand from "../ui/PlayerHand";
import {Button} from "../ui/Button";

const Game2 = () => {
    /** View/Context info */
    const { gameId } = useParams();
    const { stompClient } = useContext(StompContext);
    const { connect } = useContext(StompContext);
    const { user } = useContext(UserContext)
    const isMounted = useRef(false)

    /** Game state */
    const [players, setPlayers] = useState([])
    const [currentBet, setCurrentBet] = useState(0)
    const [currentPot, setCurrentPot] = useState(0)
    const [gamePhase, setGamePhase] = useState("")

    /** Video data */
    const [videoData, setVideoData] = useState(null)

    /** Player specific data*/
    const [player, setPlayer] = useState(null)
    const [playerBet, setPlayerBet] = useState(0);
    const [comments, setComments] = useState([])

    /** handle error messages */
    const [errorMessage, setErrorMessage] = useState(null)
    const [showErrorMessage, setShowErrorMessage] = useState(false)

    /** Websocket subscriptions */
    const playersSubscription = useRef(null)
    const gameStateSubscription = useRef(null)
    const videoDataSubscription = useRef(null)
    const gameEndSubscription = useRef(null)
    const commentsSubscription = useRef(null)
    const showDownSubscription = useRef(null)
    const errorSubscription = useRef(null)

    /** Mounting & Cleanup */
    useEffect(() => {

        setPlayer(new Player())
        // TODO this is mock data, should be replaced by actual data from backend
        const websocketSetup = async () => {
            if (!stompClient.current) {
                stompClient.current = connect();
            }
            playersSubscription.current = stompClient.current.subscribe(`/topic/games/${gameId}/players`, handlePlayersUpdate)
            gameStateSubscription.current = stompClient.current.subscribe(`/topic/games/${gameId}/state`, handleGameStateUpdate)
            videoDataSubscription.current = stompClient.current.subscribe(`/topic/games/${gameId}/video`, handleVideoDataUpdate)
            gameEndSubscription.current = stompClient.current.subscribe(`/topic/games/${gameId}/end`, handleGameEnd)
            commentsSubscription.current = stompClient.current.subscribe(`/topic/games/${gameId}/players/${user.token}/hand`, handleNewHand)
            showDownSubscription.current = stompClient.current.subscribe(`/topic/games/${gameId}/showdown`, handleShowDown)
            errorSubscription.current = stompClient.current.subscribe(`/topic/games/${gameId}/error`, handleError)
        }
        // get all info
        websocketSetup().then(() => {
            stompClient.current.send(`/app/games/${gameId}/sendData`, {}, "gimme data blease")
            stompClient.current.send(`/app/games/${gameId}/players/${user.token}/sendHand`, {}, "gimme comments blease")
        });

        isMounted.current = true;

        return () => {
            // unsubscribe and remove player from game
            // TODO: move this to separate function, add beforeUnload event listener
            if(playersSubscription.current) playersSubscription.current.unsubscribe()
            if(gameStateSubscription.current) gameStateSubscription.current.unsubscribe()
            if(videoDataSubscription.current) videoDataSubscription.current.unsubscribe()
            if(gameEndSubscription.current) gameEndSubscription.current.unsubscribe()
            if(commentsSubscription.current) commentsSubscription.current.unsubscribe()
            if(showDownSubscription.current) showDownSubscription.current.unsubscribe()
            if(errorSubscription.current) errorSubscription.current.unsubscribe()

            isMounted.current = false;
        }
    }, []);

    /** Websocket Message Handlers */
    const handlePlayersUpdate = (message) => {
        const playerArray = JSON.parse(message.body)
        playerArray.map((p) => {
            if (p.token === user.token) {
                setPlayer(p)
            }
        })
        if(isMounted.current) {
            setPlayers(playerArray)
        }
    }
    const handleGameStateUpdate = (message) => {
        const gameState = JSON.parse(message.body)
        if(isMounted.current) {
            setCurrentBet(gameState.currentBet)
            setCurrentPot(gameState.currentPot)
            setGamePhase(gameState.gamePhase)
            // hasStarted and roundWinnerToken are also passed here
        }
    }
    const handleVideoDataUpdate = (message) => {
        const data = JSON.parse(message.body)
        if(isMounted.current) {
            setVideoData(data)
        }
     }
    const handleNewHand = (message) => {
        const hand = JSON.parse(message.body)
        setComments(hand)
    }

    const handleGameEnd = () => {}

    const handleShowDown = () => {}

    const handleError = (message) => {
        const errorMessage = JSON.parse(message.body).message
        console.log(errorMessage)
        setErrorMessage(errorMessage)
        setShowErrorMessage(true)
    }
    const handleCloseError = () => {
        setShowErrorMessage(false)
    }

    /** Player Decision Handlers */
    const handlePlayerBet = () => {
        // TODO check if player score is enough to call >> all-in if not (?)
        const raiseAmount = playerBet;
        console.log("RAISED BY " + raiseAmount)
        console.log("PlayerBet " + playerBet)
        console.log("currentBet " + currentBet)
        if (playerBet === currentBet) {
            const decision = "CALL"
            stompClient.current.send(`/app/games/${gameId}/players/${player.token}/decision`, {},
                JSON.stringify({decision, raiseAmount}));
        }
        else {
            const decision = "RAISE"
            stompClient.current.send(`/app/games/${gameId}/players/${player.token}/decision`, {},
                JSON.stringify({decision, raiseAmount}));
        }
    }
    const handlePlayerFold = () => {
        const decision = "FOLD"
        const raiseAmount = "0"
        stompClient.current.send(`/app/games/${gameId}/players/${player.token}/decision`, {},
            JSON.stringify({decision, raiseAmount}));
    }

    let content = <Spinner/>

    if(player) {
        content = (
            <BaseContainer>
                <div className="game container">
                    <div className="game content main">
                        <ScoreBoard list={players}/>
                        {videoData ? <VideoDisplay thumbnailUrl={videoData.thumbnailUrl}
                                      title={videoData.title}
                                      releaseDate={videoData.releaseDate}
                                      duration={videoData.duration}
                                      likes={videoData.likes}
                                      views={videoData.views}
                        /> : <Spinner/>}
                        <div className="game content sidebar">
                            <div className="game info">
                                <div>INFO</div>
                                <div>Round: {gamePhase}</div>
                                <div>Current Pot: {currentPot}</div>
                            </div>
                            <PlayerButtons isCurrentPlayer={player.currentPlayer}
                                           currentBet={currentBet}
                                           playerScore={player.score}
                                           playerBet={playerBet}
                                           setPlayerBet={setPlayerBet}
                                           handlePlayerFold={handlePlayerFold}
                                           handlePlayerBet={handlePlayerBet}
                            />
                        </div>
                    </div>
                    <div className="game content footer">
                        <PlayerHand comments={comments}/>
                    </div>
                    {showErrorMessage && (
                        <div className="game error">
                            <p>Error Message: {errorMessage}</p>
                            <Button onClick={handleCloseError}>Close</Button>
                        </div>
                    )}
                </div>
            </BaseContainer>
        )
    }

    return content;
}

export default Game2