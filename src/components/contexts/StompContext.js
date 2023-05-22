import React, {createContext, useEffect, useRef} from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import {getDomain} from "../../helpers/getDomain";

const StompContext = createContext({});

export function StompProvider (props) {

  const stompClient = useRef(null);
  const isConnected = useRef(false);

  // connect to the WebSocket server and return the Stomp client
  const connect = async () => {
    let client = stompClient.current;
    if(!client) {
      const domain = getDomain();
      const socket = new SockJS(`${domain}/sopra-websocket`);
      client = Stomp.over(socket);
      await new Promise((resolve) => client.connect({}, resolve));
      stompClient.current = client;
      isConnected.current = true;
      console.log("Websocket connected")
    }
    return client;
  };

  /** CLEANUP */
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (stompClient) {
        alert("Websocket disconnected! You might need to start a new game.")
        stompClient.current.disconnect();
        isConnected.current = false;
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    // disconnect & remove beforeunload listener on component unmount
    return () => {
        if (stompClient.current) {
            stompClient.current.disconnect();
            isConnected.current = false;
        }
        window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, []);


  return (
    <StompContext.Provider value={{ stompClient, isConnected, connect }}>
      {props.children}
    </StompContext.Provider>
  );
}


export default StompContext;