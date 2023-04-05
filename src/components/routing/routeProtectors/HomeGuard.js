// check if user is registered, if not, redirect to GuestHomepage

import PropTypes from "prop-types";
import GuestHomepage from "components/views/GuestHomepage";

/**
 * returns the children if the user is logged in, otherwise redirects to GuestHomepage
 */
export const HomeGuard = props => {
    // if user is not logged in
    if (!localStorage.getItem("token")) {
        return <GuestHomepage/>;
    }
    // if user is logged in, render Homepage
    return props.children;
};

HomeGuard.propTypes = {
    children: PropTypes.node
}