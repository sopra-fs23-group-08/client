import React from "react";
import ReactDOM from "react-dom";
import "styles/index.scss";
import App from "App";
import Game from "components/views/Game";

/**
 * This is the entry point of your React application where the root element is in the public/index.html.
 * We call this a “root” DOM node because everything inside it will be managed by React DOM.
 * Applications built with just React usually have a single root DOM node.
 * More: https://reactjs.org/docs/rendering-elements.html
 */
ReactDOM.render(<App />, document.getElementById("root"));

ReactDOM.render(
  <>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
    <App />
  </>,
  document.getElementById('root')
);
