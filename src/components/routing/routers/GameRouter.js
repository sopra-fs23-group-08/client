import { Redirect, Route } from "react-router-dom";
import Game from "components/views/TestGame";
import PropTypes from 'prop-types';
import Lobby from "../../views/Lobby";

const GameRouter = props => {
  /**
   * "this.props.base" is "/app" because as been passed as a prop in the parent of GameRouter, i.e., App.js
   */
  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <Route exact path={`${props.base}`}>
        <Redirect to={`${props.base}/games/:gameId`} />
      <Game/>
      </Route>
      <Route exact path={`${props.base}/games/:gameId/lobby`}>
        <Lobby/>
      </Route>
    </div>
  );
};

GameRouter.propTypes = {
  base: PropTypes.string
};

export default GameRouter;
