import React, {useContext, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {Button} from 'components/ui/Button';
import 'styles/views/Login.scss';
import BaseContainer from "components/ui/BaseContainer";
import {BaseBox} from "../ui/BaseBox";
import {Input} from "../ui/Input";
import logo from "../../styles/assets/logo.png";
import {Dialog, DialogTitle, DialogActions, DialogContent, TextField} from "@material-ui/core";
import UserContext from "../contexts/UserContext";
import User from "../../models/User";
import {api, handleError} from "../../helpers/api";

/*
It is possible to add multiple components inside a single file,
however be sure not to clutter your files with an endless amount!
As a rule of thumb, use one file per component and only add small,
specific components that belong to the main one in the same file.
 */

const Login = () => {
  const { setUser } = useContext(UserContext);
  const history = useHistory();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [guestUsername, setGuestUsername] = useState("");

  const doLogin = async () => {
    try {
      const requestBody = JSON.stringify({username, password});
      const response = await api.post("/login", requestBody);

      // Get the returned user and update a new object.
      const fetchedUser = new User(response.data);

      // Store the token into the local storage.
      localStorage.setItem('token', fetchedUser.token);

      // Login successfully worked --> navigate to the route /game in the GameRouter
      history.push(`/home`);
    }
    catch (error) {
      const response = error.response;

      if(response.status === 401) {
        alert(`${response.data.message}`);
      }

      else if(response.status === 404) {
        alert(`${response.data.message}`);
      }
      else {
        alert(`Something went wrong during the login: \n${handleError(error)}`);
      }
    }
  };

  const toggleDialog = () => {
    setDialogOpen(!dialogOpen);
  }

  // create token, store it, pass guestUser as location state in history.push
  const playAsGuest = () => {
    const name = guestUsername;
    const token = "guest" + crypto.randomUUID();
    const guestUser = new User({name, token});
    // store user to context
    setUser(guestUser);

    localStorage.setItem("token", token);

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
                onClick={() => toggleDialog()}
            >
              Play as guest
            </Button>
            <Dialog open={dialogOpen} onClose={toggleDialog}>
              <DialogTitle>
                What should we call you?
              </DialogTitle>
              <DialogContent>
                <TextField label={"Enter a username"}
                           onChange={e => setGuestUsername(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={toggleDialog}>
                  Cancel
                </Button>
                <Button onClick={playAsGuest}>
                  Confirm
                </Button>
              </DialogActions>
            </Dialog>

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

export default Login;
