import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Loader2, Maximize2, MessageSquare, Minimize2, Send, X, Sparkles, Bot, Settings, RefreshCw, Download, Share2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '@/context/AuthProvider';
import axios from 'axios';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import api from '@/lib/api';  // Import the API client

// Message type definition
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Generate a unique message ID
function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

// Default AI messages for non-authenticated users
const defaultMessages: Message[] = [
  {
    id: generateId(),
    content: "Hello! I'm EduBot, your AI learning assistant. I can help you find courses, answer questions about topics, and provide learning resources. Sign in for personalized assistance!",
    sender: 'ai',
    timestamp: new Date()
  }
];

// Context-aware prompts based on current page
const getContextualPrompts = (pathname: string) => {
  if (pathname.includes('/courses')) {
    return [
      "What courses do you offer in machine learning?",
      "Which courses are best for beginners?",
      "How do I enroll in a course?",
      "Are there any advanced programming courses?",
      "What are the most popular courses?"
    ];
  } else if (pathname.includes('/dashboard/student')) {
    return [
      "How can I track my course progress?",
      "Where do I find my certificates?",
      "Can you recommend my next course?",
      "How do I communicate with instructors?",
      "How to update my learning preferences?"
    ];
  } else if (pathname.includes('/profile')) {
    return [
      "How do I change my profile picture?",
      "Where can I update my personal information?",
      "How do I connect social media accounts?",
      "Can I make my profile private?",
      "How to view my achievements and badges?"
    ];
  } else {
    return [
      "Tell me about your learning platform",
      "What courses do you recommend for beginners?",
      "How do the certifications work?",
      "What career paths do you offer courses for?",
      "How is course content structured?"
    ];
  }
};

// Component styles
const drawerWidth = 'clamp(300px, 25vw, 400px)';

export function AIAssistant() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoverElement, setHoverElement] = useState<HTMLElement | null>(null);
  const [contextualPrompts, setContextualPrompts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [aiTheme, setAiTheme] = useState('modern');
  const [responseLength, setResponseLength] = useState('balanced');
  const { user } = useAuth();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update contextual prompts when location changes
  useEffect(() => {
    setContextualPrompts(getContextualPrompts(location.pathname));
  }, [location.pathname]);
  
  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Check if hovering over a course card or important element
      const element = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      if (element?.closest('.course-card') || element?.closest('[data-ai-highlight="true"]')) {
        setHoverElement(element);
      } else {
        setHoverElement(null);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Load user AI preferences
  useEffect(() => {
    if (user?.preferences?.ai) {
      if (user.preferences.ai.voiceEnabled !== undefined) {
        setVoiceEnabled(user.preferences.ai.voiceEnabled);
      }
      if (user.preferences.ai.theme) {
        setAiTheme(user.preferences.ai.theme);
      }
      if (user.preferences.ai.responseLength) {
        setResponseLength(user.preferences.ai.responseLength);
      }
    }
  }, [user]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && activeTab === 'chat') {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized, activeTab]);
  
  // Handle personalized welcome message when user signs in
  useEffect(() => {
    if (user) {
      const hasWelcomeMessage = messages.some(
        m => m.sender === 'ai' && m.content.includes(`Welcome back, ${user.name}`)
      );
      
      if (!hasWelcomeMessage) {
        const personalizedGreeting: Message = {
          id: generateId(),
          content: `Welcome back, ${user.name}! I'm here to help with your learning journey. Feel free to ask about courses, your progress, or any educational topics you're interested in.`,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prevMessages => 
          prevMessages.length === 1 && prevMessages[0].content === defaultMessages[0].content
            ? [personalizedGreeting]
            : [...prevMessages, personalizedGreeting]
        );
      }
    }
  }, [user, messages]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Create a new message
    const newMessage = {
      id: generateId(),
      content: inputValue,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    // Update the messages with the new one
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    
    // Clear the input field
    setInputValue('');
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Send message to API
      const response = await api.post('/ai/chat', {
        message: newMessage.content
      });
      
      // Create AI response message
      const aiResponse = {
        id: generateId(),
        content: response.data.message,
        sender: 'ai' as const,
        timestamp: new Date()
      };
      
      // Update messages with AI response
      setMessages([...updatedMessages, aiResponse]);
      
      // Save conversation to localStorage
      localStorage.setItem('ai-conversation', JSON.stringify([...updatedMessages, aiResponse]));
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      // Create error message
      const errorMessage = {
        id: generateId(),
        content: "I'm sorry, I'm having trouble connecting to the server. Please try again later.",
        sender: 'ai' as const,
        timestamp: new Date()
      };
      
      // Update messages with error
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Clear chat history
  const handleClearChat = () => {
    setMessages(user ? [] : defaultMessages);
    
    // If user is authenticated, also clear server-side chat history
    if (user) {
      const token = localStorage.getItem('eduflow-token');
      if (token) {
        axios.delete(`${API_BASE_URL}/ai/chat/history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }).catch(error => {
          console.error('Failed to clear chat history on server:', error);
        });
      }
    }
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    // Focus the input field
    inputRef.current?.focus();
  };
  
  // Save AI settings
  const handleSaveAISettings = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('eduflow-token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const aiPreferences = {
        voiceEnabled,
        theme: aiTheme,
        responseLength
      };
      
      const response = await axios.put(
        `${API_BASE_URL}/users/preferences`,
        { 
          preferences: { 
            ai: aiPreferences 
          } 
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        if (response.data.user) {
          localStorage.setItem('eduflow-user', JSON.stringify(response.data.user));
          // Update auth context
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('user-preferences-updated'));
          }
        }
        toast.success("AI preferences saved");
        setActiveTab('chat');
      }
    } catch (error) {
      console.error('Error saving AI settings:', error);
      toast.error("Failed to save AI settings");
    }
  };
  
  // Export chat history
  const handleExportChat = () => {
    if (messages.length === 0) return;
    
    const chatText = messages
      .map(msg => `[${msg.sender.toUpperCase()}]: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eduflow-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Determine if we should show the AI assistant based on user preferences
  const shouldShowAssistant = () => {
    if (!user || !user.preferences) return true;
    return user.preferences.showAIAssistant !== false;
  };
  
  if (!shouldShowAssistant()) {
    return null;
  }
  
  return (
    <>
      {/* Main chatbot button */}
      <Button
        className={cn(
          'fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg',
          isOpen ? 'bg-primary/90 hover:bg-primary/80' : 'bg-primary hover:bg-primary/90'
        )}
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageSquare className="h-5 w-5" />
        )}
      </Button>
      
      {/* AI chatbot panel */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-30 bg-card border-l border-border shadow-xl transition-all duration-300 ease-in-out',
            isMinimized ? 'w-auto h-auto bottom-20 right-6 rounded-md' : 'bottom-0 right-0 top-0 flex flex-col',
            isMinimized ? '' : `w-full sm:w-[${drawerWidth}]`
          )}
        >
          {isMinimized ? (
            // Minimized view
            <Button
              variant="ghost"
              className="p-2"
              onClick={() => setIsMinimized(false)}
              aria-label="Expand AI assistant"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              <span className="text-xs">Expand</span>
            </Button>
          ) : (
            // Full view
            <>
              <header className="border-b p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="mr-2" onClick={() => setIsMinimized(true)}>
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center">
                    <Bot className="h-5 w-5 mr-2 text-primary" />
                    <span className="font-medium text-sm">EduFlow AI Assistant</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                        <Settings className="h-4 w-4 mr-2" />
                        <span>AI Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleClearChat}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        <span>Clear Chat</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </header>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="px-3 pt-3 grid grid-cols-2 w-full">
                  <TabsTrigger value="chat" className="text-xs sm:text-sm">Chat</TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="flex-1 flex flex-col p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
                  {/* Chat messages */}
                  <ScrollArea className="flex-1 p-3">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex flex-col max-w-[85%] p-3 rounded-lg text-sm",
                            message.sender === 'user'
                              ? "ml-auto bg-primary text-primary-foreground"
                              : "mr-auto bg-muted text-foreground"
                          )}
                        >
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          <span className="text-xs opacity-70 mt-1 text-right">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div ref={messagesEndRef} />
                  </ScrollArea>
                  
                  {/* Suggested prompts */}
                  {messages.length <= 2 && !isLoading && (
                    <div className="p-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
                      <div className="flex flex-wrap gap-2">
                        {contextualPrompts.slice(0, 3).map((prompt, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs py-1 h-auto whitespace-normal text-left"
                            onClick={() => handleSuggestionClick(prompt)}
                          >
                            {prompt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Input area */}
                  <div className="p-3 border-t flex items-end gap-2">
                    <div className="flex-1">
                      <Input
                        ref={inputRef}
                        placeholder="Type your message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className="min-h-10 py-2 resize-none text-sm"
                      />
                    </div>
                    <Button
                      size="icon"
                      disabled={isLoading || !inputValue.trim()}
                      onClick={handleSendMessage}
                      className="flex-shrink-0"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent 
                  value="settings" 
                  className="py-0 px-3 sm:px-6 data-[state=active]:flex data-[state=active]:flex-col"
                >
                  <ScrollArea className="flex-1">
                    <div className="py-4 space-y-6">
                      <h3 className="text-base font-medium">AI Assistant Settings</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Voice Responses</Label>
                            <p className="text-xs text-muted-foreground">
                              Enable voice output for AI responses
                            </p>
                          </div>
                          <Switch
                            checked={voiceEnabled}
                            onCheckedChange={setVoiceEnabled}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>AI Appearance</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {['modern', 'classic', 'minimal'].map((theme) => (
                              <Button
                                key={theme}
                                variant={aiTheme === theme ? "default" : "outline"}
                                size="sm"
                                className="text-xs capitalize"
                                onClick={() => setAiTheme(theme)}
                              >
                                {theme}
                              </Button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Response Length</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {['concise', 'balanced', 'detailed'].map((length) => (
                              <Button
                                key={length}
                                variant={responseLength === length ? "default" : "outline"}
                                size="sm"
                                className="text-xs capitalize"
                                onClick={() => setResponseLength(length)}
                              >
                                {length}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setActiveTab('chat')}
                          className="order-2 sm:order-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSaveAISettings}
                          size="sm"
                          className="order-1 sm:order-2"
                        >
                          Save Settings
                        </Button>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      )}
      
      {/* Tooltip when hovering over elements */}
      {isOpen && hoverElement && !isMinimized && (
        <div 
          className="fixed bg-popover text-popover-foreground text-sm p-2 rounded shadow-lg z-50 max-w-xs"
          style={{
            top: mousePosition.y + 10,
            left: mousePosition.x + 10
          }}
        >
          {hoverElement.closest('.course-card') && "Ask me about this course!"}
          {hoverElement.closest('[data-ai-highlight="true"]') && "Need help with this? Ask me!"}
        </div>
      )}
    </>
  );
}
