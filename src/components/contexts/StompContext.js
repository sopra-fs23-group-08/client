import React, { useState, createContext, useEffect } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export const StompContext = createContext({
  stompClient: null,
  setStompClient: () => {},
  isConnected: false,
});

// TODO: fix useEffects, they don't work as commented
// TODO: use useRef for isConnected and maybe stompClient
// TODO: remove setStompClient from context --> clients don't need to set it, they connect via this context
export const StompProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // TODO: fix useEffects, they don't work as commented
  // TODO: use useRef for isConnected and maybe stompClient
  // TODO: remove setStompClient from context --> clients don't need to set it, they connect via this context
  // connect to the WebSocket server and return the Stomp client
  const connect = async () => {
    let client = stompClient;
    if(!client) {
      const socket = new SockJS("http://localhost:8080/sopra-websocket");
      client = Stomp.over(socket);
      await new Promise((resolve) => client.connect({}, resolve));
      setStompClient(client);
      setIsConnected(true);
      console.log("Websocket connected")
    }
    return client;
  };

  // disconnect the Stomp client on unmount
  useEffect(() => {
    return () => {
      if (stompClient) {
        stompClient.disconnect();
        setIsConnected(false);
      }
    };
  }, [stompClient]);

  // check if the Stomp client is connected
  useEffect(() => {
    if (stompClient) {
      const intervalId = setInterval(() => {
        if (!stompClient.connected) {
          setIsConnected(false);
        }
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [stompClient]);

  return (
    <StompContext.Provider value={{ stompClient, setStompClient, isConnected, connect }}>
      {children}
    </StompContext.Provider>
  );
};


export default StompContext;




