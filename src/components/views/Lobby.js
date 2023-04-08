import {
    Button,
    FormControl,
    Grid,
    InputLabel,
    Select,
    TextField,
    Typography,
  } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { useStyles } from './styles/lobbyStyles';


const Lobby = () => {

    const classes = useStyles();
    const history = useHistory();
  
    const handleStartGame = () => {
      history.push('/game');
    };
  
    const handleUserClick = (id) => {
      history.push(`/users/${id}`);
    }
  
    const handleBackClick = () => {
        history.push('/home');
    };


    const lobby = (

// define lobbyConTainer

            <div className={classes.lobbyContainer}>
              
                <div className={classes.titleContainer}>
                    <Typography variant="h3" className={classes.title}>
                        TESTUSER's LOBBY
                    </Typography>

                    <div className={classes.lobbyCodeContainer}>
                        <Typography className={classes.lobbyCode}>CODE: XYZ123</Typography>
                        <Button variant="contained" color="primary">
                            COPY
                        </Button>
                    </div>

                    <svg
                        className={classes.backIcon}
                        viewBox="0 0 24 24"
                        onClick={handleBackClick}
                    >
                        <path d="M24 11.5H3.83l7.88-7.88L10.5.62.62 10.5l9.71 9.71 1.41-1.41-7.88-7.88H24v-2z" />
                    </svg>

                </div>

                <Grid container spacing={3}>
                </Grid>
                
                <Grid item xs={12} md={5}>


                        <div className={classes.lobbyMain}>


                            <div className={classes.playerListContainer}>
                                <Typography variant="h6" className={classes.textPlayers}>
                                    PLAYERS
                                </Typography>

                                <div className="lobby-players-list">
                                    <div className={classes.playerButtonContainer} onClick={() => handleUserClick('your-id')}>
                                        <div className={classes.circle}></div>
                                        <Typography className={classes.playerName}>YOU</Typography>
                                    </div>
                                    <div className={classes.playerButtonContainer} onClick={() => handleUserClick('user2-id')}>
                                        <div className={classes.circle}></div>
                                        <Typography className={classes.playerName}>TESTUSER2</Typography>
                                    </div>
                                    <div className={classes.playerButtonContainer} onClick={() => handleUserClick('user3-id')}>
                                        <div className={classes.circle}></div>
                                        <Typography className={classes.playerName}>TESTUSER3</Typography>
                                    </div>
                                    <div className={classes.playerButtonContainer} onClick={() => handleUserClick('user4-id')}>
                                        <div className={classes.circle}></div>
                                        <Typography className={classes.playerName}>TESTUSER4</Typography>
                                    </div>
                                    <div className={classes.playerButtonContainer} onClick={() => handleUserClick('user5-id')}>
                                        <div className={classes.circle}></div>
                                        <Typography className={classes.playerName}>TESTUSER5</Typography>
                                    </div>
                                    <div className={classes.playerButtonContainer} onClick={() => handleUserClick('user6-id')}>
                                        <div className={classes.circle}></div>
                                        <Typography className={classes.playerName}>TESTUSER6</Typography>
                                    </div>
                                </div>

                                <div className={classes.path}></div>


                            </div>
                          </div>
                </Grid>


                <Grid item xs={12} md={5}>



                        <div className={classes.settingsContainer}>
                            <Typography variant="h6" className={classes.textSettings}>SETTINGS</Typography>



                        <div className={classes.settingsLeft}>

                                <div className={classes.settingsTitle}>
                                    <Typography>MODIFY VIDEO-POOL</Typography>
                                </div>

                            <FormControl>
                                <InputLabel htmlFor="lobby-language-select">Language</InputLabel>
                                <Select
                                    className={classes.languageSelect}
                                    native
                                    inputProps={{
                                        id: 'lobby-language-select'
                                    }}
                                >
                                    <option value="en">ENGLISH</option>
                                    <option value="de">GERMAN</option>
                                    <option value="zh">CHINESE</option>
                                </Select>
                            </FormControl>

                            <div className={classes.settingsTitle}>
                                <Typography>Playlist</Typography>
                            </div>
                            <TextField type="text" placeholder="Paste a link here" fullWidth />

                        <div className={classes.settingsTitle}>
                            <Typography>PLAYERS</Typography>
                        </div>

                        <div className="lobby-players-setting-container">
                            <div className="lobby-players-setting-value">
                                <TextField
                                    className={classes.playersTextField}
                                    placeholder="Enter number of players"
                                    inputProps={{ min: 3, max: 6, step: 1 }}
                                    type="number" />
                            </div>
                        </div>



                        <div className={classes.settingsTitle}>
                            <Typography>START INFO</Typography>
                        </div>
                        <div className={classes.onOffSwitchContainer}>
                            <Typography variant="subtitle1" className={classes.onOffSwitchLabel}>Show start info</Typography>
                            <div className={`${classes.onOffSwitch} off`}></div>
                        </div>
                    </div>

                <div className={classes.settingsRight}>
                <Typography>SET BALANCE & BLINDS</Typography>

                <div className={classes.setBalanceBlindsContainer}>
                    <Typography className={classes.setBalanceBlindsTitle}>INITIAL BALANCE:</Typography>
                    <div className={classes.balanceRow}>
                        <Typography className={classes.inputLabel}>$</Typography>
                        <TextField type="text" placeholder="0" className={classes.balanceInput} />
                    </div>
                    <div className={classes.blindRow}>
                        <Typography className={classes.inputLabel}>BIG BLIND:</Typography>
                        <TextField type="text" placeholder="0" className={classes.blindInput} />
                        <Typography className={classes.inputLabel}>SMALL BLIND:</Typography>
                        <TextField type="text" placeholder="0" className={classes.blindInput} />
                    </div>
                </div>

                <Button variant="contained" color="primary" className={classes.startGameButton} onClick={handleStartGame}>START GAME</Button>
            </div>
          </div>
          </Grid>
    </div>
);       

  return lobby;
}

export default Lobby;