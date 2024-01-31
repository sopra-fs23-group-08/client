import 'styles/ui/ScoreBoard.scss';

const ScoreBoard = (props) => {

    // TODO: add players current bet
    return (
        <div className={"scoreboard container"}>
            <div className={"base-card"}>
                {props.list.map((player, index) => {
                    let indicator;
                    if(player.currentPlayer) {
                        indicator = <div className={"scoreboard indicator active"}/>
                    }
                    else {
                        indicator = <div className={"scoreboard indicator inactive"}/>
                    }
                    return (
                        <div className={"scoreboard player box"} key={index}>
                            {indicator}
                            <div className={"scoreboard player info"}>
                                <div>
                                    <b> {player.username} | {player.score} points</b>
                                </div>
                                <div>{player.scorePutIntoPot ? player.scorePutIntoPot + " points" : null} | {player.lastDecision === "NOT_DECIDED" ? null : player.lastDecision}</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ScoreBoard