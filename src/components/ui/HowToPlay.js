import React, { useState, useEffect } from 'react';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip} from '@material-ui/core';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import IconButton from '@material-ui/core/IconButton';
import PropTypes from "prop-types";


// players in a game can click How to play button in game page, to see the prompt of how to play

// player can scroll up and down

// player can click close tag to close how to play prompt and go back to game

// if player doesn't close how to play, the prompt will close automatically after 15 seconds, to make sure the player doesn't stay too long in this page


const HowToPlay = (props) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setOpen(false);
    }, 15000);
    return () => clearTimeout(timeout);
  }, [open]);

  return (
    <div>
      <Button onClick={handleClickOpen}
              variant={'outlined'}
              color={'inherit'}
      >
        How to Play
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>How to Play</DialogTitle>
        <DialogContent dividers>
          <h3>Limitations</h3>
          <p>Max. 7 players</p>
          <p>6 cards every game-round</p>
          <p>Time per turn: 20 sec</p>

          <h3>Options</h3>
          <p>First betting-round with/without information</p>
          <p>Choose language/playlist of videos to be used in the game (to get comments from & use as the round video)</p>
          <p>Choose starting capital & big/small blind values</p>

          <h3>Rough rundown</h3>
          <p>Players are dealt a hand of comment-cards, they may only view their own cards.</p>
          <p>During the game, information about a single YouTube-video is revealed to all players in increments; release-date, view count, length, thumbnail, title etc. </p>
          <p>Between the reveal of each piece of information, a betting round takes place. </p>
          <p>The betting system is based on poker: upon a players turn, they are prompted to decide whether they want to call, fold, raise or go all-in. </p>
          <p>A player may not raise twice in a row during the same betting-round; if I raise and everyone else calls, I may not raise again. </p>
          <p>If all but one player fold, the remaining player wins, if more than one player remains after the final betting-round, their hands are revealed for all. </p>
          <p>The Winner is the player whose hand contains more comments taken from the revealed YouTube-video comment section.</p>
          <p>If player A has 3 comments in their hand that match the YouTube-video and player B has 5 comments matching the video, player B is the winner.</p>

          <h3>Player Hands</h3>
          <p>Every round, players are dealt 6 cards that only they can view; a card displays the text of a YouTube-comment. </p>
          <p>A player's hand will contain 0-6 comments that actually match the current video. </p>
          <p>Comments which are taken from the comment-section of the video that is being presented for the current round. </p>
          <p>The rest of the comments are taken from random other videos. </p>
          <p>The player's job is to try and deduce, how many of their cards match the current video.</p>
          <p>The more of your comments match the current video, the better your hand is. </p>
          <p>No two player hands contain the same amount of matching comments; therefore the maximum number of players is 7 and a winner can always be determined. </p>

          <h3>Before the Game</h3>
          <p>Players start out with a set number of points; they are used by the player to place bets throughout the game. </p>
          <p>The players are dealt a hand of cards and two players provide the small and big blind. </p>

          <h3>Rules of a Round</h3>
          <p>In the first betting-round, the big-blind player is the last to take their turn.</p>
          <p>The player to their left starts the betting. </p>
          <p>In the other betting-rounds, the button is the last to take their turn.</p>
          <p>Players have 30 seconds to take their turn, if they do not make a choice within that time, they will automatically fold. </p>
          <p>After each round, the winner of current round will be declared and all players remaining will enter next round. </p>

          <h3>Decisions during a Round</h3>
          <p>Players take turns in clockwise rotation. </p>
          <p>A player can call, fold and raise.</p>
          <p>Call: matching the big blinds.</p>
          <p>Fold: not adding any points to the pool and dropping out of the game for the current round.</p>
          <p>Raise: raising the bet above the big blind.</p>
          <p>The betting ends if all players have called or folded. </p>
          <p>The points that are bet by a player are put into a pot, the points in the pot are added to the winners score when the game-round ends.  </p>

          <h3>End of a Game</h3>
          <p>A game ends if all but one player fold, or after the 4th betting round. </p>
          <p>If more than one player remains at the end, the player whose hand contains more comments matching the current video is the winner.  </p>
          <p>After determining a winner, the points in the current pot are added to their score and the pot is reset. </p>


          </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

HowToPlay.propTypes = {
  color: PropTypes.string
}

export default HowToPlay;