
import { useState } from "react";
import { MessageSquare, Users, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  sender: string;
  content: string;
}

interface ChatSidebarProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

const ChatSidebar = ({ messages, onSendMessage }: ChatSidebarProps) => {
  const [message, setMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"chat" | "participants">("chat");
  
  const sendMessage = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
  };
  
  return (
    <div className="border-l h-full flex flex-col">
      {/* Tabs */}
      <div className="grid grid-cols-2 border-b">
        <Button 
          variant={activeTab === "chat" ? "default" : "ghost"} 
          className="rounded-none h-12"
          onClick={() => setActiveTab("chat")}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Chat
        </Button>
        <Button 
          variant={activeTab === "participants" ? "default" : "ghost"} 
          className="rounded-none h-12"
          onClick={() => setActiveTab("participants")}
        >
          <Users className="h-4 w-4 mr-2" />
          Participants
        </Button>
      </div>
      
      {/* Chat messages */}
      {activeTab === "chat" && (
        <>
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.length > 0 ? (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${
                    msg.sender === "You" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender !== "You" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{msg.sender[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <Card className={`p-2 px-3 max-w-[80%] ${
                    msg.sender === "You" ? "bg-primary text-primary-foreground" : ""
                  }`}>
                    {msg.sender !== "You" && (
                      <p className="text-xs font-medium mb-1">{msg.sender}</p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                  </Card>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2" />
                <p>No messages yet</p>
                <p className="text-sm">Start the conversation!</p>
              </div>
            )}
          </div>
          
          {/* Message input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={e => e.key === "Enter" && sendMessage()}
              />
              <Button size="icon" onClick={sendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
      
      {/* Participants tab (placeholder) */}
      {activeTab === "participants" && (
        <div className="flex-grow p-4">
          <div className="text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <p>Participants will be displayed here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
