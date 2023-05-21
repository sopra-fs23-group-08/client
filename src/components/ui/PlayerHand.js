import 'styles/ui/PlayerHand.scss'
import PropTypes from "prop-types";

const PlayerHand = (props) => {

    const comments = props.comments.map((comment, index) => {
        return (
            <div className="hand comment" key={index}>
                <div className="hand header">
                    {comment.first.author}
                </div>
                <div className="hand body">
                    {comment.first.content}
                </div>
            </div>
        )
    })

    return (
        <div className="hand container">
            {comments}
        </div>
    )
}

PlayerHand.propTypes = {
    comments: PropTypes.array
}

export default PlayerHand