import 'styles/ui/Input.scss';
import PropTypes from "prop-types";

export const Input = props => {
    return (
        <input
            className="primary-input"
            type={props.type}
            placeholder={props.placeholder}
            onChange={e => props.onChange(e.target.value)}
        />
    )
}

Input.propTypes = {
    placeholder: PropTypes.string,
    type: PropTypes.string,
    onChange: PropTypes.func
};
