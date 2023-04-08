import { makeStyles } from "@material-ui/core/styles";
import {
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    Select,
    TextField,
    Typography,
  } from "@material-ui/core";
import { useHistory } from "react-router-dom";


const useStyles = makeStyles((theme) => ({
    root: {
      backgroundImage: `url(${require("../../styles/assets/background.png").default})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      height: "100vh",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.palette.background.paper,
      borderRadius: "15px 15px 0 0",
      height: "40px",
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
      marginBottom: theme.spacing(2),
    },
    lobbyTitle: {
      color: "black",
      fontSize: "1.5rem",
      fontWeight: "bold",
      margin: 0,
    },
    lobbyCode: {
      backgroundColor: "black",
      borderRadius: "20px",
      padding: theme.spacing(0.5, 2),
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    codeText: {
      color: "white",
      marginRight: theme.spacing(2),
      fontWeight: "bold",
    },
    playersContainer: {
      marginRight: theme.spacing(4),
      flex: 1,
    },
    playersHeader: {
      fontSize: "1.2rem",
      fontWeight: "bold",
      margin: theme.spacing(2, 0, 1),
    },
    playerName: {
      color: "white",
      display: "flex",
      alignItems: "center",
      margin: theme.spacing(1),
    },
    playerButton: {
      backgroundColor: "black",
      borderRadius: "15px",
      padding: theme.spacing(1, 2),
      marginLeft: theme.spacing(2),
      "&:hover": {
        backgroundColor: "#434343",
      },
    },
    settingsContainer: {
      flex: 1,
    },
    settingsHeader: {
      fontSize: "1.2rem",
      fontWeight: "bold",
      margin: theme.spacing(2, 0),
    },
    settingsSection: {
      marginBottom: theme.spacing(3),
      borderRadius: "15px",
      padding: theme.spacing(2),
      backgroundColor: theme.palette.background.paper,
    },
    settingsTitle: {
      fontWeight: "bold",
      marginBottom: theme.spacing(1),
    },
    languageSelect: {
      width: "100%",
      marginBottom: theme.spacing(2),
    },
    balanceInput: {
      width: "40%",
      marginRight: theme.spacing(3),
    },
    blindInput: {
      width: "25%",
      marginRight: theme.spacing(3),
    },
    startGameButton: {
      backgroundColor: "black",
      borderRadius: "15px",
      padding: theme.spacing(2, 4),
      marginTop: theme.spacing(4),
      float: "right",
      "&:hover": {
        backgroundColor: "#434343",
      },
    },
  }));
    

const Lobby = () => {

    const classes = useStyles();
    const history = useHistory();
  
    const handleStartGame = () => {
      history.push('/game');
    };
  
    const handleUserClick = (id) => {
      history.push(`/users/${id}`);
    }
  
    const lobby = (
        <div className={classes.root}>
          <div className={classes.header}>
            <h1 className={classes.lobbyTitle}>TESTUSER's LOBBY</h1>
            <div className={classes.lobbyCode}>
              <Typography className={classes.codeText}>CODE: XYZ123</Typography>
              <Button variant="contained" color="primary">COPY</Button>
            </div>
          </div>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <div className={classes.playersContainer}>
                <Typography variant="h6" className={classes.playersHeader}>PLAYERS</Typography>
                <div className="lobby-players-list">
                  <div className={classes.playerName}>
                    <Typography>YOU</Typography>
                    <Button className={classes.playerButton} onClick={() => handleUserClick('your-id')}>VIEW</Button>
                  </div>
                  <div className={classes.playerName}>
                    <Typography>TESTUSER2</Typography>
                    <Button className={classes.playerButton} onClick={() => handleUserClick('user2-id')}>VIEW</Button>
                  </div>
                  <div className={classes.playerName}>
                    <Typography>TESTUSER3</Typography>
                    <Button className={classes.playerButton} onClick={() => handleUserClick('user3-id')}>VIEW</Button>
                  </div>
                  <div className={classes.playerName}>
                    <Typography>TESTUSER4</Typography>
                    <Button className={classes.playerButton} onClick={() => handleUserClick('user4-id')}>VIEW</Button>
                  </div>
                  <div className={classes.playerName}>
                    <Typography>TESTUSER5</Typography>
                    <Button className={classes.playerButton} onClick={() => handleUserClick('user5-id')}>VIEW</Button>
                  </div>
                  <div className={classes.playerName}>
                    <Typography>TESTUSER6</Typography>
                    <Button className={classes.playerButton} onClick={() => handleUserClick('user6-id')}>VIEW</Button>
                  </div>
                  <div className={classes.playerName}>
                    <Typography>TESTUSER7</Typography>
                    <Button className={classes.playerButton} onClick={() => handleUserClick('user7-id')}>VIEW</Button>
                  </div>
                </div>
              </div>
            </Grid>
            <Grid item xs={12} md={6}>
              <div className={classes.settingsContainer}>
                <div className={classes.settingsSection}>
                  <Typography variant="h6" className={classes.settingsHeader}>SETTINGS</Typography>
                  <div className={classes.settingsTitle}>
                    <Typography>MODIFY VIDEO-POOL</Typography>
                  </div>
                </div>
                  <div>
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
                  </div>
                  <div className={classes.settingsTitle}>
                    <Typography>Playlist</Typography>
                  </div>
                  <div>
                    <TextField type="text" placeholder="Paste a link here" fullWidth />
                  </div>
                </div>
                <div className={classes.settingsSection}>
                  <div className={classes.settingsTitle}>
                    <Typography>PLAYERS</Typography>
                  </div>
                  <div>
                  <div className="lobby-players-setting-container">
          <div className="lobby-players-setting-value">4</div>
          <div className="lobby-players-setting-arrow"></div>
        </div>
      </div>
      <div className={classes.settingsSection}>
        <div className={classes.settingsTitle}>
          <Typography>START INFO</Typography>
        </div>
        <div>
          <FormControlLabel
            control={<Checkbox color="primary" />}
            label="Show start info"
          />
        </div>
      </div>
      <div className={classes.settingsSection}>
        <div className={classes.settingsTitle}>
          <Typography>SET BALANCE & BLINDS</Typography>
        </div>
        <div>
          <div>
            <Typography className={classes.settingsTitle}>Initial balance:</Typography>
            <TextField type="text" placeholder="0" className={classes.balanceInput} />
          </div>
          <div className={classes.settingsRow}>
            <div className={classes.settingsTitle}>Big blind:</div>
            <TextField type="text" placeholder="0" className={classes.blindInput} />
            <div className={classes.settingsTitle}>Small blind:</div>
            <TextField type="text" placeholder="0" className={classes.blindInput} />
          </div>
          <Button variant="contained" color="primary" className={classes.startGameButton} onClick={handleStartGame}>START GAME</Button>
        </div>
      </div>
    </div>
  </Grid>
</Grid>
</div>
);       

  return lobby;
}

export default Lobby;