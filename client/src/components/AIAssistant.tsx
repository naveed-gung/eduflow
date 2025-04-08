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
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    // Focus the input field
    inputRef.current?.focus();
  };
  
  // Handle settings dropdown
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Handle toggle chat visibility
  const handleToggleChat = () => {
    setIsOpen(prev => !prev);
  };
  
  // Clean up API_BASE_URL references with api client
  const handleClearChat = () => {
    setMessages(user ? [] : defaultMessages);
    
    // If user is authenticated, also clear server-side chat history
    if (user) {
      api.delete('/ai/chat/history').catch(error => {
        console.error('Failed to clear chat history on server:', error);
      });
    }
  };
  
  // Save AI settings
  const handleSaveAISettings = async () => {
    if (!user) return;
    
    try {
      const aiPreferences = {
        voiceEnabled,
        theme: aiTheme,
        responseLength
      };
      
      const response = await api.put(
        '/users/preferences',
        { 
          preferences: { 
            ai: aiPreferences 
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
        setIsSettingsOpen(false);
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
  
  // Prevent layout shift when opening dropdown
  useEffect(() => {
    const handleSettingsDropdown = () => {
      if (isSettingsOpen) {
        // Save the current scrollbar width
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        // Add padding to body to prevent layout shift
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
      } else {
        // Reset padding
        document.body.style.paddingRight = '';
      }
    };
    
    handleSettingsDropdown();
    
    return () => {
      // Cleanup
      document.body.style.paddingRight = '';
    };
  }, [isSettingsOpen]);
  
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
      {/* AI chatbot panel */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-30 bg-card border border-border shadow-xl transition-all duration-300 ease-in-out rounded-xl',
            isMinimized ? 'w-auto h-auto bottom-20 right-6 rounded-md' : 'bottom-6 right-6 top-[80px] flex flex-col',
            isMinimized ? '' : 'w-[90vw] sm:w-[380px] md:w-[420px] lg:w-[460px] h-[calc(100vh-120px)]'
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
              <header className="border-b p-2 flex items-center justify-between rounded-t-xl">
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="mr-2" onClick={() => setIsMinimized(true)}>
                    <Minimize2 className="h-4 w-4" />
        </Button>
                  <div className="flex items-center">
                    <Bot className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium text-sm">EduFlow AI Assistant</span>
      </div>
            </div>
                <div className="flex items-center">
                  <DropdownMenu open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="p-0 z-50" sideOffset={5}>
                      <DropdownMenuItem onClick={handleClearChat} className="cursor-pointer">
                        <RefreshCw className="h-3 w-3 mr-2" />
                        <span>Clear Chat</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <div className="p-3 w-64 max-h-80 overflow-auto">
                        <h3 className="text-xs font-medium mb-2">AI Settings</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-xs">Voice Responses</Label>
                              <p className="text-xs text-muted-foreground">
                                Enable voice output
                              </p>
                            </div>
                            <Switch
                              checked={voiceEnabled}
                              onCheckedChange={setVoiceEnabled}
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-xs">AI Appearance</Label>
                            <div className="grid grid-cols-3 gap-1">
                              {['modern', 'classic', 'minimal'].map((theme) => (
                                <Button
                                  key={theme}
                                  variant={aiTheme === theme ? "default" : "outline"}
                                  size="sm"
                                  className="text-xs capitalize h-7 px-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAiTheme(theme);
                                  }}
                                >
                                  {theme}
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-xs">Response Length</Label>
                            <div className="grid grid-cols-3 gap-1">
                              {['concise', 'balanced', 'detailed'].map((length) => (
                                <Button
                                  key={length}
                                  variant={responseLength === length ? "default" : "outline"}
                                  size="sm"
                                  className="text-xs capitalize h-7 px-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setResponseLength(length);
                                  }}
                                >
                                  {length}
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveAISettings();
                            }}
                            size="sm"
                            className="w-full text-xs mt-2"
                          >
                            Save Settings
                          </Button>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleExportChat} className="cursor-pointer">
                        <Download className="h-3 w-3 mr-2" />
                        <span>Export Chat</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleToggleChat}>
                    <X className="h-3 w-3" />
          </Button>
        </div>
              </header>
              
              <div className="relative flex-1">
                {/* Background logo */}
                <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                  <div className="relative">
                    <img 
                      src="/favicon.svg" 
                      alt="EduFlow Logo" 
                      className="w-24 h-24 opacity-70"
                    />
                    <div className="absolute inset-0 rounded-full filter blur-md bg-primary/10 -z-10 shadow-lg shadow-primary/20"></div>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col h-full">
                  {/* Chat messages */}
                  <ScrollArea className="flex-1 p-2">
                    <div className="space-y-3">
                      {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                            "flex flex-col max-w-[85%] p-2 rounded-lg text-sm",
                            message.sender === 'user'
                              ? "ml-auto bg-primary text-primary-foreground"
                              : "mr-auto bg-muted text-foreground"
                          )}
                        >
                          <div className="whitespace-pre-wrap break-words">{message.content}</div>
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
                    <div className="p-2 border-t">
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
                  <div className="p-2 border-t flex items-end gap-2 rounded-b-xl">
                    <div className="flex-1">
                      <Input
                        ref={inputRef}
                        placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className="min-h-9 py-1 resize-none text-sm"
                      />
                    </div>
                    <Button
                      size="icon"
                      disabled={isLoading || !inputValue.trim()}
                      onClick={handleSendMessage}
                      className="flex-shrink-0 h-9 w-9"
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Send className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
          </div>
                    </div>
            </>
          )}
        </div>
      )}
      
      {/* Chat toggle button */}
      {!isOpen && (
        <Button
          className="fixed bottom-6 right-6 z-40 h-10 w-10 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          onClick={handleToggleChat}
          size="icon"
          aria-label="Open AI assistant"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
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
