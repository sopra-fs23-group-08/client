import { Redirect, Route } from "react-router-dom";
import Game from "components/views/Game";
import PropTypes from 'prop-types';
import TestLobby from "../../views/TestLobby";

const GameRouter = props => {
  /**
   * "this.props.base" is "/app" because as been passed as a prop in the parent of GameRouter, i.e., App.js
   */
  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <Route exact path={`${props.base}/lobby`}>
        <TestLobby/>
      </Route>
      <Route exact path={`${props.base}`}>
        <Redirect to={`${props.base}`} />
      </Route>
    </div>
  );
};

GameRouter.propTypes = {
  base: PropTypes.string
};

export default GameRouter;
