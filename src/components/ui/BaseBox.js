import 'styles/ui/BaseBox.scss';
import PropTypes from "prop-types";
export const BaseBox = props => {
    return (
        <div className="base-box">
            {props.children}
        </div>
    );
}

BaseBox.propTypes = {
    children: PropTypes.node,
}