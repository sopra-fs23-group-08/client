import PropTypes from "prop-types";
import "styles/ui/VideoDisplay.scss";
const VideoDisplay = (props) => {

    const parseDuration = (duration) => {
        const match = duration.match(/PT(\d+)M(\d+)S/);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            return minutes + " min " + seconds + " sec";
        }
        return "";
    }

    const parseDate = (date) => {
        const dateString = date.slice(4)
        return dateString.replace(/\s\d{2}:\d{2}:\d{2}\sCEST/, "")
    }

    const parseNumber = (number) => {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    }

    return (
        <div className="video container">
            {props.title ? <div className="video title">{props.title}</div> : null}
            {props.thumbnailUrl ? <img className="video thumbnail" src={props.thumbnailUrl} alt="thumbnail"/> : null}
            <div className="video info">
                <div>• {props.duration ? parseDuration(props.duration) : null}, posted on {props.releaseDate ? parseDate(props.releaseDate) : null}</div>
                <div>• {props.likes ? parseNumber(props.likes): null} likes</div>
                <div>• {props.views? parseNumber(props.views): null} views</div>
            </div>
        </div>
    )
}

VideoDisplay.propTypes = {
    thumbnailUrl: PropTypes.string,
    title: PropTypes.string,
    releaseDate: PropTypes.string,
    duration: PropTypes.string,
    likes: PropTypes.number,
    views: PropTypes.number,
}
export default VideoDisplay