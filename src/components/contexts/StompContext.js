import {createContext, useState} from "react";

const StompContext = createContext(undefined);

export function StompProvider(props) {

    const [stompClient, setStompClient] = useState(null);

    return (
        <StompContext.Provider value={{ stompClient, setStompClient }}>
            {props.children}
        </StompContext.Provider>
    );
}

export default StompContext;