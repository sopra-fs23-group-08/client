import {Redirect} from "react-router-dom";
import PropTypes from "prop-types";

/**
 *
 * Another way to export directly your functional component.
 */
export const LoginGuard = props => {
  if (!localStorage.getItem("token")) {
    return props.children;
  }
  if (localStorage.getItem("token").slice(0, 5) === "guest") {
    localStorage.removeItem("token");
    return props.children;
  }

  // if user is already logged in, redirects to the main /app
  return <Redirect to="/home"/>;
};

LoginGuard.propTypes = {
  children: PropTypes.node
}