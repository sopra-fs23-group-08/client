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
import React, {useState} from "react";
import SearchIcon from '@material-ui/icons/Search';
import VideogameAssetIcon from '@material-ui/icons/VideogameAsset';
import InputIcon from '@material-ui/icons/Input';
import HowToPlay from "../ui/HowToPlay";

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
        justifyContent:'space-evenly'
    },
    menuIcon: {
        fontSize: 100
    }

}));


const GuestHomepage = props => {

    const classes = useStyles();
    const history = useHistory();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [LobbyID, setLobbyID] = useState([""]);

    const createGame = () => {
        history.push("/games/123/lobby")
    }

    const joinLobby = () => {
        history.push(`/games/${LobbyID}/lobby`)
    }

    const handleLobbyIDChange = (e) => {setLobbyID(e.target.value)}

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
                                G
                            </Avatar>
                            <Typography className={classes.headerTitle}>
                                Playing as Guest
                            </Typography>
                            <HowToPlay/>
                        </Toolbar>
                    </AppBar>

                    <Grid container
                          className={classes.cardContainer}
                    >
                        <Grid item>
                            <Tooltip title={'Join Game'}>
                                <IconButton onClick={toggleDialog}>
                                    <InputIcon className={classes.menuIcon}/>
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