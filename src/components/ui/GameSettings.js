import {makeStyles} from "@material-ui/core/styles";
import {AppBar, Card, CardContent, Grid, Select, TextField, Typography} from "@material-ui/core";
import {Button} from "./Button";
import PropTypes from "prop-types";

const useStyles = makeStyles((theme) => ({
    mainContainer: {
        height: "100%",
        width: "70%",
        justifyContent: "space-around"
    },
    settingBox: {

    },
}));

// creates a labeled card with children as content
const SettingBox = (props) => {
    return (
            <Card>
                <AppBar position={"relative"}
                        height={"10em"}
                >
                    <Typography variant={"h5"}
                                align={"center"}
                    >
                        {props.label}
                    </Typography>
                </AppBar>
                <CardContent>
                    {props.children}
                </CardContent>
            </Card>
    )
};

SettingBox.propTypes = {
    label: PropTypes.string,
    children: PropTypes.node
}

// creates a label around its children
const LabeledSetting = (props) => {
    return (
        <Grid container
              direction={"column"}
              alignItems={"center"}
              justifyContent={"space-evenly"}
        >
            <Grid item xs={12}>
                <Typography variant={"h6"}>
                    {props.label}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                {props.children}
            </Grid>
        </Grid>
    )
}

LabeledSetting.propTypes = {
    label: PropTypes.string,
    children: PropTypes.node
}

// handler methods are passed in as props
// isHost boolean is passed in as prop -> if false, disable all inputs
// Material ui generates a warning because it uses the selected option on <option> instead of defaultValue on the select tag
const GameSettings = (props) => {
    const classes = useStyles();

    return (
        <Grid container
              justifyContent={"space-around"}
              spacing={2}
        >
            <Grid item xs={6}>
                <SettingBox label={"Video Pool"}>
                    <LabeledSetting label={"Language"}>
                        <Select
                            className={classes.languageSelect}
                            onChange={event => props.onLanguageChange(event.target.value)}
                            disabled={!props.isHost}
                            value={props.language}
                        >
                            <option value="ENGLISH">ENGLISH</option>
                            <option value="GERMAN">GERMAN</option>
                            <option value="CHINESE">CHINESE</option>
                        </Select>
                    </LabeledSetting>
                    <LabeledSetting label={"Playlist"}>
                        <TextField placeholder="Paste a link here"
                                   onChange={event => props.onPlaylistUrlChange(event.target.value)}
                                   disabled={!props.isHost}
                                   value={props.playlistUrl}
                                   fullWidth />
                    </LabeledSetting>
                </SettingBox>
            </Grid>
            <Grid item xs={6}>
                <SettingBox label={"Balance & Blinds"}>
                    <LabeledSetting label={"Initial Balance"}>
                        <TextField onChange={event => props.onBalanceChange(event.target.value)}
                                   disabled={!props.isHost}
                                   value={props.balance}
                                   fullWidth />
                    </LabeledSetting>
                    <LabeledSetting label={"Big Blind"}>
                        <TextField onChange={event => props.onBigBlindChange(event.target.value)}
                                   disabled={!props.isHost}
                                   value={props.bigBlind}
                                   fullWidth />
                    </LabeledSetting>
                    <LabeledSetting label={"Small Blind"}>
                        <TextField onChange={event => props.onSmallBlindChange(event.target.value)}
                                   disabled={!props.isHost}
                                   value={props.smallBlind}
                                   fullWidth />
                    </LabeledSetting>
                </SettingBox>
            </Grid>
            <Grid item xs={3}>
                <Button onClick={props.onSaveSettings}
                        disabled={!props.isHost}
                >
                    Save
                </Button>
            </Grid>
        </Grid>
    )

}

GameSettings.propTypes = {
    isHost: PropTypes.bool,
    language: PropTypes.string,
    balance: PropTypes.string,
    smallBlind: PropTypes.string,
    bigBlind: PropTypes.string,
    playlistUrl: PropTypes.string,
    onLanguageChange: PropTypes.func,
    onBalanceChange: PropTypes.func,
    onBigBlindChange: PropTypes.func,
    onSmallBlindChange: PropTypes.func,
    onPlaylistUrlChange: PropTypes.func,
    onSaveSettings: PropTypes.func
}

export default GameSettings