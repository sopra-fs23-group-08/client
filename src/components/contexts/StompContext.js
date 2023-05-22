import React, {createContext, useEffect, useRef} from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import {getDomain} from "../../helpers/getDomain";

const StompContext = createContext({});

export function StompProvider (props) {
  //const [stompClient, setStompClient] = useState(null);
  //const [isConnected, setIsConnected] = useState(false);

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
      localStorage.setItem('storedClient', JSON.stringify(stompClient.current));
      }
      if (isConnected) {
      localStorage.setItem('storedIsConnected', JSON.stringify(isConnected.current));
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    // Load data from local storage on component mount
    const storedClient = localStorage.getItem('storedClient');
    const storedIsConnected = localStorage.getItem('storedIsConnected');
    if (storedClient) {
      stompClient.current = (JSON.parse(storedClient));
    }
    if (storedIsConnected) {
      isConnected.current = (JSON.parse(storedIsConnected));
    }
    
    //unmount if closed
    return () => {
        if (stompClient.current) {
            stompClient.current.disconnect();
            isConnected.current = false;
      }
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, []);

  /* disconnect the Stomp client on unmount
  useEffect(() => {
    return () => {
      if (stompClient) {
        stompClient.disconnect();
        setIsConnected(false);
      }
    };
  }, [stompClient]);*/

  // check if the Stomp client is connected

  return (
    <StompContext.Provider value={{ stompClient, isConnected, connect }}>
      {props.children}
    </StompContext.Provider>
  );
}


export default StompContext;