import Ably from 'ably';

const ably = new Ably.Realtime('Aj5RCA.lkSclA:JY7AdllhPQkqoWqgyuxqUA3KeUBA_4ZkQhC8jJnuPYY');
const channel = ably.channels.get('raytracing-game');

// Example: Send and receive game state
channel.subscribe('game-state', (message) => {
  console.log('Received game state:', message.data);
});

// Example: Publish game state
channel.publish('game-state', { playerX: 100, playerY: 200 });
