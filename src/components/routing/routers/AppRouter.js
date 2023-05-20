import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import {LoginGuard} from "components/routing/routeProtectors/LoginGuard";
import HomeGuard from "components/routing/routeProtectors/HomeGuard";
import Login from "components/views/Login";
import Profile from "components/views/Profile";
import EditProfile from "components/views/EditProfile";
import Homepage from "components/views/Homepage";
import Search from "components/views/Search";
import Register from "../../views/Register";
import Lobby from "../../views/Lobby";
import Game from "../../views/TestGame";

/**
 * Main router of your application.
 * In the following class, different routes are rendered. In our case, there is a Login Route with matches the path "/login"
 * and another Router that matches the route "/game".
 * The main difference between these two routes is the following:
 * /login renders another component without any sub-route
 * /game renders a Router that contains other sub-routes that render in turn other react components
 * Documentation about routing in React: https://reacttraining.com/react-router/web/guides/quick-start
 */
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/users/:userId/edit">
          <EditProfile/>
        </Route>
        <Route exact path="/users/search">
          <Search/>
        </Route>
        <Route path="/users/:userId">
          <Profile/>
          </Route>
          <Route path="/games/:gameId/lobby">
            <Lobby/>
          </Route>
          <Route path="/games/:gameId">
            <Game/>
          </Route>
        <Route path="/home">
          <HomeGuard>
            <Homepage/>
          </HomeGuard>
        </Route>
        <Route exact path="/register">
          <Register/>
        </Route>
        <Route exact path="/login">
          <LoginGuard>
            <Login/>
          </LoginGuard>
        </Route>
        <Route exact path="/">
          <Redirect to="/login"/>
        </Route>
      </Switch>
    </BrowserRouter>
  );
};

/*
* Don't forget to export your component!
 */
export default AppRouter;
