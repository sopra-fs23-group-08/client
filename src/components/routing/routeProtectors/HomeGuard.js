// check if user is registered, if not, redirect to GuestHomepage

import PropTypes from "prop-types";
import GuestHomepage from "components/views/GuestHomepage";

/**
 * returns the children if the user is registered, otherwise redirects to GuestHomepage
 */

const HomeGuard = props => {

    // to pass guestUser from Login to GuestHomepage
    const token = localStorage.getItem("token");

    // if user is registered (no "guest" token), render children
    // TODO: figure out how to pass registered users ID to homepage
    if (token && token.slice(0, 5) !== "guest") {
        return props.children;
    }

    // if user is guest, redirect to GuestHomepage
    return <GuestHomepage/>;
};

HomeGuard.propTypes = {
    children: PropTypes.node
}

export default HomeGuard;