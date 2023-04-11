import React, {useState} from 'react';
import {api, handleError} from 'helpers/api';
import User from 'models/User';
import {useHistory} from 'react-router-dom';
import {Button} from 'components/ui/Button';
import 'styles/views/Login.scss';
import BaseContainer from "components/ui/BaseContainer";
import {BaseBox} from "../ui/BaseBox";
import {Input} from "../ui/Input";
import logo from "../../styles/assets/logo.png";

/*
It is possible to add multiple components inside a single file,
however be sure not to clutter your files with an endless amount!
As a rule of thumb, use one file per component and only add small,
specific components that belong to the main one in the same file.
 */

const Login = props => {
  const history = useHistory();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const doLogin = async () => {
    /*
    try {
      const requestBody = JSON.stringify({username, password});
      const response = await api.post('/users', requestBody);

      // Get the returned user and update a new object.
      const user = new User(response.data);

      // Store the token into the local storage.
      localStorage.setItem('token', user.token);

      // Login successfully worked --> navigate to the route /game in the GameRouter
      history.push(`/register`);
    } catch (error) {
      alert(`Something went wrong during the login: \n${handleError(error)}`);
    }
    */
  };

  const playAsGuest =  () => {
    const guestToken = "guest" + crypto.randomUUID();
    localStorage.setItem("token", guestToken);
    history.push(`/home`);
  }

  return (
    <BaseContainer>
      <BaseBox>
        <div className="login main-container">
          <div className="login form">
            <Input
                placeholder="USERNAME"
                value={username}
                onChange={un => setUsername(un)}
            />
            <Input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={pw => setPassword(pw)}
            />
            <div className="login form button-container">
              <Button
                  disabled={!username || !password}
                  onClick={() => doLogin()}
              >
                Login
              </Button>
              <Button
                  onClick={() => history.push(`/register`)}
              >
                Register
              </Button>
            </div>
            <Button
                margin="auto"
                onClick={() => playAsGuest()}
            >
              Play as guest
            </Button>
          </div>
          <div className="login graphics">
            <img
                className="login graphics logo"
                src={logo} alt="logo"
            />
          </div>
        </div>
      </BaseBox>
    </BaseContainer>
  );
};

/**
 * You can get access to the history object's properties via the withRouter.
 * withRouter will pass updated match, location, and history props to the wrapped component whenever it renders.
 */
export default Login;
