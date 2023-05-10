import BaseContainer from "../ui/BaseContainer";
import {Button} from "../ui/Button";
import {Input} from "../ui/Input";
import {BaseBox} from "../ui/BaseBox";
import 'styles/views/Register.scss';
import logo from 'styles/assets/logo.png'
import {useState} from "react";
import {useHistory} from "react-router-dom";
import {api, handleError} from 'helpers/api';
import User from "../../models/User";

const Register = () => {

    const history = useHistory();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordMatch, setPasswordMatch] = useState(false);

    const doRegister = async () => {
        
        try {
            const requestBody = JSON.stringify({username, password});
            const response = await api.post('/users', requestBody);

            // Get the returned user and update a new object.
            const user = new User(response.data);

            // Store the token into the local storage.
            localStorage.setItem('token', user.token);

            // Login successfully worked --> navigate to the route /game in the GameRouter
            history.push(`/home`);
        }   catch (error) {
            alert(`Something went wrong during the sign up: \n${handleError(error)}`);
            window.location.reload();
      
          }
        
    };

    return (
        <BaseContainer>
            <BaseBox>
                <div className="register main-container">
                    <div className="register form">
                        <Input
                            placeholder="USERNAME"
                            value={username}
                            onChange={un => setUsername(un)}
                        />
                        <Input
                            placeholder="PASSWORD"
                            type={"password"}
                            value={password}
                            onChange={pw => setPassword(pw)}
                        />
                        <Input
                            placeholder="CONFIRM PASSWORD"
                            type={"password"}
                            onChange={e => {setPasswordMatch(e === password)}}
                        />
                        <div className="register form button-container">
                            <Button
                                disabled={!username || !password || !passwordMatch}
                                onClick={() => doRegister()}

                            >
                                Create Account
                            </Button>
                            <Button
                                onClick={() => history.push("/login")}
                            >
                                Back
                            </Button>
                        </div>
                    </div>
                    <div className="register graphics">
                        <img
                            className="register graphics logo"
                            src={logo} alt="logo"
                        />
                    </div>
                </div>
            </BaseBox>
        </BaseContainer>
    );
}

export default Register;