import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import chatService from '@/services/api/chatService';
import { getAll as getTeamMembers } from '@/services/api/teamMemberService';

const ChatChannel = ({ projectId = null, channelType = 'team', channelName = 'Team Chat' }) => {
  const [messages, setMessages] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentUserId = 1; // In a real app, this would come from auth context

  useEffect(() => {
    loadChatData();
  }, [projectId, channelType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = async () => {
    try {
      setLoading(true);
      const [messagesData, membersData] = await Promise.all([
        chatService.getMessagesByChannel(projectId, channelType),
        getTeamMembers()
      ]);
      setMessages(messagesData);
      setTeamMembers(membersData);
    } catch (err) {
      setError('Failed to load chat data');
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const messageData = {
        content: newMessage.trim(),
        authorId: currentUserId,
        projectId: projectId,
        channelType: channelType
      };

      const createdMessage = await chatService.create(messageData);
      setMessages(prev => [...prev, createdMessage]);
      setNewMessage('');
      toast.success('Message sent');
      inputRef.current?.focus();
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      await chatService.delete(messageId);
      setMessages(prev => prev.filter(msg => msg.Id !== messageId));
      toast.success('Message deleted');
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const getMessageAuthor = (authorId) => {
    return teamMembers.find(member => member.Id === authorId) || {
      name: 'Unknown User',
      avatar: null
    };
  };

  const formatMessageDate = (dateString) => {
    const date = parseISO(dateString);
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d at h:mm a');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const shouldShowDateSeparator = (message, index) => {
    if (index === 0) return true;
    const currentDate = parseISO(message.createdAt);
    const previousDate = parseISO(messages[index - 1].createdAt);
    return format(currentDate, 'yyyy-MM-dd') !== format(previousDate, 'yyyy-MM-dd');
  };

  const shouldShowAuthor = (message, index) => {
    if (index === 0) return true;
    const previousMessage = messages[index - 1];
    return previousMessage.authorId !== message.authorId ||
           (parseISO(message.createdAt) - parseISO(previousMessage.createdAt)) > 300000; // 5 minutes
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadChatData} />;

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <ApperIcon name="MessageCircle" size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{channelName}</h3>
            <p className="text-sm text-gray-500">
              {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadChatData}
          disabled={loading}
        >
          <ApperIcon name="RefreshCw" size={16} />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <Empty
            icon="MessageCircle"
            title="No messages yet"
            description={`Start the conversation in ${channelName.toLowerCase()}`}
          />
        ) : (
          messages.map((message, index) => {
            const author = getMessageAuthor(message.authorId);
            const showDateSeparator = shouldShowDateSeparator(message, index);
            const showAuthor = shouldShowAuthor(message, index);
            const isCurrentUser = message.authorId === currentUserId;

            return (
              <div key={message.Id}>
                {/* Date Separator */}
                {showDateSeparator && (
                  <div className="flex items-center justify-center py-2">
                    <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-500">
                      {format(parseISO(message.createdAt), 'EEEE, MMMM d, yyyy')}
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className={`flex gap-3 ${showAuthor ? '' : 'ml-12'}`}>
                  {showAuthor && (
                    <div className="flex-shrink-0">
                      {author.avatar ? (
                        <img
                          src={author.avatar}
                          alt={author.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {getInitials(author.name)}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {showAuthor && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {author.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatMessageDate(message.createdAt)}
                        </span>
                      </div>
                    )}

                    <div className="group flex items-start gap-2">
                      <div className={`px-3 py-2 rounded-lg max-w-xl ${
                        isCurrentUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>

                      {isCurrentUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMessage(message.Id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ApperIcon name="Trash2" size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${channelName.toLowerCase()}...`}
              disabled={sending}
              className="resize-none"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ApperIcon name="Loader2" size={16} className="animate-spin" />
            ) : (
              <ApperIcon name="Send" size={16} />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default ChatChannel;