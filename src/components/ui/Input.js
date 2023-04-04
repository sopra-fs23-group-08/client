import 'styles/ui/Input.scss';
import PropTypes from "prop-types";

export const Input = props => {
    return (
        <div>
            <input
                className="primary-input"
                placeholder={props.placeholder}
            />
        </div>
    )
}

Input.propTypes = {
    placeholder: PropTypes.string,
    onChange: PropTypes.func
};
