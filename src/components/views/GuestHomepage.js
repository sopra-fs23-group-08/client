import {useHistory} from "react-router-dom";
import {
    Grid,
    Card,
    AppBar,
    Typography,
    Toolbar,
    Avatar,
    IconButton,
    Button,
    Tooltip, Dialog, DialogTitle, DialogContent, TextField, DialogActions
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import React, {useContext, useState} from "react";
import SearchIcon from '@material-ui/icons/Search';
import VideogameAssetIcon from '@material-ui/icons/VideogameAsset';
import InputIcon from '@material-ui/icons/Input';
import HowToPlay from "../ui/HowToPlay";
import {api} from "../../helpers/api";
import UserContext from "../contexts/UserContext";

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
        direction: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerAvatar: {
        marginRight: theme.spacing(2)
    },
    headerTitle: {
        flexGrow: 1
    },
    mainCard: {
        width: '80vw',
        height: '80vh',
    },
    cardBar: {
        alignContent: 'center',
        justifyContent: 'space-between',
        height: '20%'
    },
    cardContainer: {
        height: '80%',
        width: '100%',
        alignItems: 'center',
        justifyContent:'space-evenly',
        color: 'white'
    },
    menuIcon: {
        fontSize: 100,
        color: 'black'
    },
    button: {
        visibility: 'visible'
    }

}));


// differences to HomePage.js:
// - no view profile option
// - creates placeholder user object
// - sets guest token in localstorage on first mount
const GuestHomepage = () => {

    const classes = useStyles();
    const history = useHistory();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [LobbyID, setLobbyID] = useState([""]);
    const { user } = useContext(UserContext);
    const [showHowToPlay, setShowHowToPlay] = useState(false);

    const createGame = async () => {
        console.log("Creating game...");
        try {
            const name = user.name;
            const token = user.token;
            const response = await api.post("/games", JSON.stringify({name, token}));
            // Here we use location.state to pass the user object to the lobby
            // up until here we used localStorage to store the user object
            // might want to change this to be consistent
            history.push(`/games/${response.data.id}/lobby`, {user: user});
        }
        catch (error) {
            alert(`Couldn't create a new game: ${error.response.data.message}`);
        }
    }

    const joinLobby = () => {
        console.log("Joining lobby...");
        // TODO check if lobby exists/is full
        history.push(`/games/${LobbyID}/lobby`, {user: user})
    }

    const handleLobbyIDChange = (e) => {setLobbyID(e.target.value)}

    const toggleHowToPlay = () => {
        setShowHowToPlay(!showHowToPlay);
      };

    const toggleDialog = () => {
        setDialogOpen(!dialogOpen);
    }


    return (
        <Grid container
              className={classes.root}
        >
            <Grid item>
                <Card
                    className={classes.mainCard}
                >
                    <AppBar
                        position={'relative'}
                    >
                        <Toolbar
                            className={classes.cardBar}
                        >
                            <Avatar className={classes.headerAvatar}>
                                {user.name.charAt(0)}
                            </Avatar>
                            <Typography className={classes.headerTitle}>
                                Playing as {user.name}
                            </Typography>
                            <button color = {'inherit'}  onClick={toggleHowToPlay}>How to Play</button>
                                {/* Show how to play window when "help" button is clicked */}
                                {showHowToPlay && <HowToPlay handleClose={() => setShowHowToPlay(false)} />}
                        </Toolbar>
                    </AppBar>

                    <Grid container
                          className={classes.cardContainer}
                    >
                        <Grid item>
                            <Tooltip aria-
                                title={'Join Game'}
                                >
                                <IconButton onClick={toggleDialog} className={classes.button} style={{ color: 'black' }} aria-hidden = {false}>
                                    <InputIcon className={classes.menuIcon} aria-hidden = {false}/>
                                </IconButton>
                            </Tooltip>
                            <Dialog open={dialogOpen} onClose={toggleDialog}>
                                <DialogTitle>
                                    Join Game
                                </DialogTitle>
                                <DialogContent>
                                    <TextField label={"Enter Lobby ID"}
                                               onChange={handleLobbyIDChange}
                                    />
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={toggleDialog}>
                                        Cancel
                                    </Button>
                                    <Button onClick={joinLobby}>
                                        Join
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </Grid>
                        <Grid item>
                            <Tooltip title={'Create Game'}>
                                <IconButton onClick={() => {createGame()}}>
                                    <VideogameAssetIcon className={classes.menuIcon}/>
                                </IconButton>
                            </Tooltip>
                        </Grid>
                        <Grid item>
                            <Tooltip title={'Search Player'}>
                                <IconButton onClick={() => history.push("/users/search")}>
                                    <SearchIcon className={classes.menuIcon}/>
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Card>
            </Grid>
        </Grid>
    )
}

export default GuestHomepage;