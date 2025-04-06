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

// API base URL
const API_BASE_URL = 'http://localhost:5000/api';

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
    
      const userMessage: Message = {
      id: generateId(),
      content: inputValue,
        sender: 'user',
        timestamp: new Date()
      };
      
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      let response;
      
      if (user) {
        // If user is authenticated, send request to the actual AI endpoint
        const token = localStorage.getItem('eduflow-token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        response = await axios.post(
          `${API_BASE_URL}/ai/chat`,
          { 
            message: inputValue,
            userId: user.id,
            preferences: {
              responseLength,
              voiceEnabled
            },
            context: {
              currentPath: location.pathname,
              currentPage: location.pathname.split('/').pop() || 'home',
              previousMessages: messages.slice(-5) // Send last 5 messages for context
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.data && response.data.message) {
          const aiMessage: Message = {
            id: generateId(),
            content: response.data.message,
            sender: 'ai',
            timestamp: new Date()
          };
          
          setMessages(prevMessages => [...prevMessages, aiMessage]);
          
          // Voice output if enabled
          if (voiceEnabled && window.speechSynthesis) {
            const speech = new SpeechSynthesisUtterance(response.data.message);
            speech.rate = 0.9;
            window.speechSynthesis.speak(speech);
          }
        }
      } else {
        // For non-authenticated users, simulate a response with a timeout
        setTimeout(() => {
          const mockResponses = [
            "I'd be happy to help with that! To get personalized assistance, please sign in first.",
            "That's a great question! For a complete answer tailored to your learning journey, please sign in to your account.",
            "I can provide detailed information about our courses once you're signed in. Would you like to do that now?",
            "To give you the most relevant recommendations, I'll need to know more about your learning history. Please sign in to proceed."
          ];
          
          const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
          
          const aiMessage: Message = {
            id: generateId(),
            content: randomResponse,
            sender: 'ai',
          timestamp: new Date()
        };
        
          setMessages(prevMessages => [...prevMessages, aiMessage]);
      }, 1000);
      }
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      // More intelligent fallback response
      const errorMessage: Message = {
        id: generateId(),
        content: "I apologize for the technical difficulty. Our server appears to be experiencing issues. Please try again in a moment, or refresh the page if the problem persists.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
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
      {/* AI Assistant icon that follows mouse partially */}
      <div
        className={cn(
          "fixed z-50 transition-all duration-300 ease-out",
          isOpen 
            ? "bottom-0 right-0 m-4" 
            : `bottom-8 right-8`
        )}
        style={
          !isOpen ? { 
            transform: `translate(${(mousePosition.x - window.innerWidth + 100) * 0.1}px, ${(mousePosition.y - window.innerHeight + 100) * 0.1}px)` 
          } : {}
        }
      >
        {/* Chat button */}
        {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
            className="h-16 w-16 rounded-full shadow-lg group hover:scale-105 transition-all duration-200"
        >
            <Bot className="h-7 w-7 group-hover:hidden" />
            <Sparkles className="h-7 w-7 hidden group-hover:block" />
        </Button>
        )}
        
        {/* Chat window */}
        {isOpen && (
          <Card className={cn(
            "flex flex-col shadow-lg transition-all duration-200 bg-background border-primary/20",
            isMinimized 
              ? "w-72 h-14 rounded-full" 
              : "w-96 rounded-lg overflow-hidden",
              "h-[600px] max-h-[80vh]"
          )}>
            {/* Chat header */}
            <div className="flex items-center justify-between bg-primary text-primary-foreground px-4 py-3">
          <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-medium">EduFlow Assistant</h3>
            </div>
              <div className="flex gap-1">
                {!isMinimized && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                        Preferences
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleClearChat}>
                        Clear conversation
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleExportChat}>
                        <Download className="mr-2 h-4 w-4" />
                        Export chat
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share feedback
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.open('https://youtu.be/dQw4w9WgXcQ', '_blank')}>
                        About EduBot
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {isMinimized ? (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
                    onClick={() => setIsMinimized(false)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
                    onClick={() => setIsMinimized(true)}
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-primary-foreground hover:bg-primary/80"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
          </Button>
              </div>
        </div>
        
            {/* Chat content */}
            {!isMinimized && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsContent value="chat" className="flex-1 flex flex-col data-[state=active]:flex data-[state=inactive]:hidden m-0 p-0">
                  {/* Messages area */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
            <div 
              key={message.id} 
              className={cn(
                            "flex max-w-[80%] rounded-lg p-3",
                            message.sender === 'user'
                              ? "ml-auto bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {message.content}
            </div>
          ))}
                      {isLoading && (
                        <div className="flex bg-muted max-w-[80%] rounded-lg p-3">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      )}
          <div ref={messagesEndRef} />
        </div>
                  </ScrollArea>
                  
                  {/* Suggested questions */}
                  {messages.length <= 2 && (
                    <div className="px-4 pb-2">
                      <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
                      <div className="flex flex-wrap gap-2">
                        {contextualPrompts.slice(0, 3).map((prompt, index) => (
                          <Button 
                            key={index} 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-auto py-1"
                            onClick={() => handleSuggestionClick(prompt)}
                          >
                            {prompt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Input area */}
                  <div className="p-4 pt-2 border-t">
          <div className="flex gap-2">
                      <Input
                        ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything..."
                        className="flex-1"
                        disabled={isLoading}
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        size="icon" 
                        disabled={isLoading || !inputValue.trim()}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
              <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {messages.length > 1 && (
                      <div className="flex justify-between mt-2">
                        <div className="text-xs text-muted-foreground">
                          {responseLength === 'concise' ? 'Concise' : responseLength === 'detailed' ? 'Detailed' : 'Balanced'} responses
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto py-0 px-2 text-xs"
                          onClick={handleClearChat}
                        >
                          Clear chat
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="flex-1 overflow-auto data-[state=active]:flex data-[state=inactive]:hidden flex-col m-0 p-4">
                  <h3 className="text-lg font-medium mb-4">AI Assistant Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-base">Voice output</Label>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Enable spoken responses</span>
                        <Switch 
                          checked={voiceEnabled} 
                          onCheckedChange={setVoiceEnabled} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-base">Response length</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['concise', 'balanced', 'detailed'].map((length) => (
                          <Button 
                            key={length}
                            variant={responseLength === length ? "default" : "outline"}
                            size="sm"
                            onClick={() => setResponseLength(length)}
                            className="capitalize"
                          >
                            {length}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {responseLength === 'concise' 
                          ? 'Brief, to-the-point answers' 
                          : responseLength === 'detailed' 
                            ? 'Comprehensive, in-depth explanations' 
                            : 'Balanced between brevity and detail'}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-base">Assistant theme</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['modern', 'classic', 'playful'].map((theme) => (
                          <Button 
                            key={theme}
                            variant={aiTheme === theme ? "default" : "outline"}
                            size="sm"
                            onClick={() => setAiTheme(theme)}
                            className="capitalize"
                          >
                            {theme}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('chat')}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveAISettings}>
                        Save changes
            </Button>
          </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </Card>
        )}
      </div>
      
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
