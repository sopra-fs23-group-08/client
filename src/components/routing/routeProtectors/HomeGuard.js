// check if user is registered, if not, redirect to GuestHomepage

import PropTypes from "prop-types";
import GuestHomepage from "components/views/GuestHomepage";

/**
 * returns the children if the user is logged in, otherwise redirects to GuestHomepage
 */
export const HomeGuard = props => {

    // if user is registered, render children
    const token = localStorage.getItem("token");
    if (token.slice(0, 5) !== "guest") {
        return props.children;
    }
    // if user is guest, render GuestHomepage
    return <GuestHomepage/>;
};

HomeGuard.propTypes = {
    children: PropTypes.node
}