import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { joinGame } from '../../services/gameService';
import backgroundImage from '../../styles/assets/background.png';
import { Box, Button, Container, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';


// currently:

// user enter game code -> click join button -> enter lobby -> click start game -> join game

// but we'd better make it like:

// only the user who start the game, can enter lobby, and set game information there, and click start game to start game

// other users can only join the game by entering game code, and click join button, directly be navigated into the game

// but the best way is:

// we establish a waiting room for users who want to join game by entering game code. After click join, they will enter waiting room

// They need wait, after the host click "start game", they can be navigated into the game

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    backgroundImage: `url(${backgroundImage})`,
    display: 'flex',
    alignItems: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    borderRadius: '10px',
  },
  input: {
    marginBottom: theme.spacing(2),
  },
}));

const JoinGame = () => {
  const [gameCode, setGameCode] = useState('');
  const classes = useStyles();
  const history = useHistory();

  const handleJoinGame = async () => {
    try {
      const gameId = await joinGame(gameCode);
      history.push(`/lobbies/${gameId}`);
    } catch (error) {
      console.error(error);
      // Display an error message to the user
    }
  };

  return (
    <Box className={classes.root}>
      <Container maxWidth="xs">
        <Box className={classes.paper}>
          <Typography variant="h5" gutterBottom>Enter game code to join:</Typography>
          <TextField
            className={classes.input}
            variant="outlined"
            label="Game Code"
            fullWidth
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleJoinGame}
          >
            Join
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default JoinGame;
