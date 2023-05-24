import "styles/ui/ShowDown.scss"
import PropTypes from "prop-types";
import {Button} from "./Button";

const HtmlComponent = ({ html }) => {
    const formattedString = { __html: html };

    return <div dangerouslySetInnerHTML={formattedString} />;
};

const ShowDown = (props) => {

    const showDownInfo = props.showdownData;
    /*const createPlayerInfo = (playerInfo, infoIndex) => {
        const headerText = playerInfo.player.name + " | " + playerInfo.hand.countCorrect + " matches";

        return (
            <div className={playerInfo.isWinner ? "showdown playerInfo winner" : "showdown playerInfo"} key={infoIndex}>
                <div className={"showdown playerInfo header"}>
                    {headerText}
                </div>
                <div className={"showdown playerInfo hand"}>
                    {playerInfo.hand.comments.map((comment, index) => {
                        return (
                            <div className={comment.second === "CORRECT" ? "showdown comment correct" : "showdown comment wrong"}
                                 key={index}
                            >
                                <div className={"showdown header"}>
                                    {comment.first.author}
                                </div>
                                <div className={"showdown body"}>
                                    <HtmlComponent html={comment.first.content}/>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    {showDownInfo.map((playerInfo, index) => {
        return createPlayerInfo(playerInfo, index)
    })}
    <Button onClick={() => props.setDisplayShowdown(false)}>
        Close
    </Button>*/
    return (
        <div className={"showdown container"}>
            <div className={"showdown card"}>
                {showDownInfo.map((playerData, index) => {
                    return (
                        <div className={playerData.isWinner ? "showdown player box winner" : "showdown player box"} key={index}>
                            <div className={"showdown player header"}>
                                {playerData.player.name + " | " + playerData.hand.countCorrect + " correct"}
                            </div>
                            <div className={"showdown player hand"}>
                                {playerData.hand.comments.map((comment, index) => {
                                    return (
                                        <div className={comment.second === "CORRECT" ? "showdown comment correct" : "showdown comment wrong"}
                                             key={index}
                                        >
                                            <div className={"showdown comment header"}>
                                                {comment.first.author}
                                            </div>
                                            <div className={"showdown comment body"}>
                                                <HtmlComponent html={comment.first.content}/>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
                <Button onClick={() => props.setDisplayShowdown(false)}
                        className={"showdown button"}
                >
                    Close
                </Button>
            </div>
        </div>
    )
}

ShowDown.propTypes = {
    showdownData: PropTypes.array,
    setDisplayShowdown: PropTypes.func
}

export default ShowDown;