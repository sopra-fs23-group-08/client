import { getDomain } from 'helpers/getDomain';
import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const Showdown = () => {
	let stompClient;
	const [jsonData, setJsonData] = useState(null);
	
	useEffect(() => {
		
		const connect = () => {//todo use the already functions from stomp context. I dunno how :(
			const domain = getDomain();
			const socket = new SockJS(`${domain}/sopra-websocket`);
			stompClient = Stomp.over(socket);
			
			stompClient.connect({}, () => {
				// Connected to STOMP server
				console.log('Connected to STOMP server');
				
				// Subscribe to a topic
				stompClient.subscribe('/topic/echoHandOwnerWinner', (message) => {//todo update this to the correct address /topic/games/{gameId}/showdown
					// Handle incoming message
					const body = JSON.parse(message.body);
					console.log('Received message:', body);
					// Call a message mapping function
					handleMessage(body);
				});
			});
		};
		
		const handleMessage = (message) => {
			// Perform actions based on the received message
			setJsonData(message);
			console.log('Handling message:', message);
			// ...
		};
		
		connect();
		
		// Clean up the connection on component unmount
		return () => {
			// Disconnect from STOMP server
			// This code will run when the component unmounts
			console.log('Disconnecting from STOMP server');
			if (stompClient) {
				stompClient.disconnect();
			}
		};
	}, []);
	
	const sendMessage = (message) => {
		if (stompClient && stompClient.connected) {
			stompClient.send('/app/echoDTO', {}, JSON.stringify(message));
		}
	};
	
return (//todo could be prettier especially the background messes with the displayed content, button is only used for testing
	<div>
	
		<button onClick={() => sendMessage({ text: 'Hello, server!' })}>
	
			Send Message
		</button>
	
		{jsonData ? (
		
			<div>
				{jsonData.map((item, index) => (
					<div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
						<h3>{item.player.name}</h3>
						<p>Is Winner: {item.isWinner ? 'Yes' : 'No'}</p>
						<h4>Hand</h4>
						<div className="card-container">
							{jsonData[0].hand.comments.map((comment, index) => (
							<div className="card" key={index}>
								<span>{comment.second}</span>
								<div className="card-top">
									<span>{comment.first.author}</span>
									<i className="fas fa-heart"></i>
								</div>
								<div className="card-main">
									{comment.first.content}
								</div>
							</div>
							))}
						</div>
						
					</div>
				))}
						
						
			</div>	
		) : (<p>No content to display</p>)}
						
						
						
	</div>
);
};
			
			
export default Showdown;	

