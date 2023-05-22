import {createContext, useEffect, useState} from "react";

const UserContext = createContext(undefined);

export function UserProvider(props) {

    const [user, setUser] = useState(null);

    useEffect(() => {
        console.log("Loading");
        const storedUser = localStorage.getItem('storedUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        // Save data to local storage whenever it changes
        if (user) {
        localStorage.setItem('storedUser', JSON.stringify(user));
        }
    }, [user]);


    return (
        <UserContext.Provider value={{user, setUser}}>
            {props.children}
        </UserContext.Provider>
    );
}
export default UserContext;