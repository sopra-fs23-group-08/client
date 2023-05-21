import {Button} from "./Button";
import PropTypes from "prop-types";
import "styles/ui/PlayerButtons.scss";

const PlayerButtons = (props) => {

    const handleNumberInput = (event) => {
        props.setPlayerBet(Number(event.target.value));
    }

    return (
        <div className="buttons container">
            <div className={"buttons side"}>
                <input className={"primary-input"}
                       type="number"
                       min={props.currentBet}
                       max={props.playerScore}
                       value={props.playerBet}
                       onChange={handleNumberInput}
                       disabled={!props.isCurrentPlayer}
                />
                <div>Current Bet: {props.currentBet}</div>
                <div>Your Score: {props.playerScore}</div>
            </div>
            <div className={"buttons side"}>
                <Button disabled={!props.isCurrentPlayer || props.playerScore < props.playerBet}
                        onClick={props.handlePlayerBet}
                >
                    {props.playerBet === props.currentBet ? "Call" : "Raise"}
                </Button>
                <Button disabled={!props.isCurrentPlayer}
                        onClick={props.handlePlayerFold}
                >
                    Fold
                </Button>
            </div>
        </div>
    );
}

PlayerButtons.propTypes = {
    isCurrentPlayer: PropTypes.bool,
    currentBet: PropTypes.number,
    playerScore: PropTypes.number,
    playerBet: PropTypes.number,
    setPlayerBet: PropTypes.func,
    handlePlayerBet: PropTypes.func,
    handlePlayerFold: PropTypes.func,
}

export default PlayerButtons;
