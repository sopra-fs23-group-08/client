import React, { useContext, useEffect, useState } from 'react';
import UserContext from 'components/contexts/UserContext';
import StompContext from 'components/contexts/StompContext';
import { Button } from 'antd';

const contextTest = () => {
	const { user } = useContext(UserContext)
	const { stompClient } = useContext(StompContext);
    const { isConnected } = useContext(StompContext);

	const handleButton = () => {
		console.log(stompClient)
		console.log(isConnected)
		console.log(user)
	}

	

	
	return (
	<div>
			<Button onClick={handleButton}></Button>
	<div>
		{ user ? (user.name): ("no user")}			
		</div>
	<div>
			
		{ stompClient ? ("stompClient.current"): ("client")}			
	</div>
	<div>
			
		{ isConnected ? (true): ("no connected")}			
	</div>
	</div>
);
};
			
			
export default contextTest;	


