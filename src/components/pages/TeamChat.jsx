import React from 'react';
import ChatChannel from '@/components/molecules/ChatChannel';

const TeamChat = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Chat</h1>
        <p className="text-gray-600 mt-1">
          Central communication hub for your entire team
        </p>
      </div>

      <ChatChannel 
        channelType="team"
        channelName="Team Chat"
      />
    </div>
  );
};

export default TeamChat;