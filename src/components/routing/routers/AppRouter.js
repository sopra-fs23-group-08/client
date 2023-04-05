import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import GameRouter from "components/routing/routers/GameRouter";
import {LoginGuard} from "components/routing/routeProtectors/LoginGuard";
import {HomeGuard} from "components/routing/routeProtectors/HomeGuard";
import Login from "components/views/Login";
import Profile from "components/views/Profile";
import EditProfile from "components/views/EditProfile";
import Homepage from "components/views/Homepage";
import Search from "components/views/Search";
import Lobby from "components/views/Lobby";
import Register from "../../views/Register";

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
        <Route exact path="/users/search">
          <Search/>
        </Route>
        <Route path="/users/:user_id/edit">
          <EditProfile/>
        </Route>
        <Route path="/users/:user_id">
          <Profile/>
        </Route>
        <Route path="/games/:game_id">
          <GameRouter base="/games:game_id"/>
        </Route>
        <Route path="/lobbies/:game_id">
          <Lobby/>
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
