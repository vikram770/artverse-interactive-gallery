import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, MessageSquare } from "lucide-react";

// Sample exhibition data
const sampleExhibitions = [
  {
    id: "1",
    title: "Modern Art: A Digital Experience",
    description: "Explore the boundaries of modern art in this fully virtual exhibition featuring works from contemporary artists around the globe. This exhibition pushes the conventional understanding of art spaces by creating an immersive digital environment where visitors can interact with the artworks and with each other. Each piece has been carefully selected to represent current trends in digital and traditional art mediums, with a focus on how technology influences artistic expression in the 21st century.",
    imageUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80",
    startDate: "2025-05-10T10:00:00Z",
    endDate: "2025-06-30T18:00:00Z",
    isVirtual: true,
    location: "Virtual Exhibition Space",
    organizer: "Digital Arts Collective",
    featuredArtists: ["Sophia Johnson", "Marcus Lee", "Elena Rodriguez"],
    attendees: 243,
    chatMessages: [
      { id: "1", userId: "4", username: "art_enthusiast", message: "The 3D gallery view is amazing! How did you create this?", timestamp: "2025-05-10T14:23:00Z" },
      { id: "2", userId: "2", username: "marcus_visual", message: "I love how interactive the experience is, especially the sound elements.", timestamp: "2025-05-10T14:25:00Z" },
      { id: "3", userId: "1", username: "sophia_art", message: "Thanks everyone for joining! We used WebGL and Three.js for the 3D environment.", timestamp: "2025-05-10T14:30:00Z" }
    ]
  },
  // Other exhibitions would be here
];

const ExhibitionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, isAuthenticated } = useAuthStore();
  const [exhibition, setExhibition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [attending, setAttending] = useState(false);
  
  // Check if this is an upcoming or ongoing exhibition
  const now = new Date();
  const isUpcoming = exhibition && new Date(exhibition.startDate) > now;
  const isOngoing = exhibition && new Date(exhibition.startDate) <= now && new Date(exhibition.endDate) >= now;
  
  useEffect(() => {
    // In a real app, fetch from database/localStorage
    const foundExhibition = sampleExhibitions.find(e => e.id === id);
    if (foundExhibition) {
      setExhibition(foundExhibition);
      // Check if user is attending
      setAttending(false); // Would check from database in real implementation
    }
    setLoading(false);
  }, [id]);
  
  const handleAttendToggle = () => {
    if (!isAuthenticated) {
      // Redirect to login
      return;
    }
    
    setAttending(!attending);
    // In a real app, update database/localStorage
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isAuthenticated) return;
    
    // In a real app, save to database/localStorage
    console.log("Sending message:", newMessage);
    
    // Add message to UI immediately
    if (exhibition && exhibition.chatMessages) {
      const newChat = {
        id: `msg_${Date.now()}`,
        userId: currentUser?.id || "",
        username: currentUser?.username || "",
        message: newMessage,
        timestamp: new Date().toISOString()
      };
      
      setExhibition({
        ...exhibition,
        chatMessages: [...exhibition.chatMessages, newChat]
      });
    }
    
    setNewMessage("");
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <p>Loading exhibition...</p>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!exhibition) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Exhibition Not Found</h1>
          <p className="mb-6">The exhibition you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/exhibitions">Back to Exhibitions</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="h-64 md:h-96 relative overflow-hidden">
          <img 
            src={exhibition.imageUrl} 
            alt={exhibition.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="container mx-auto px-4 pb-6">
              <div className="flex gap-2 mb-3">
                {isUpcoming && <Badge>Upcoming</Badge>}
                {isOngoing && <Badge variant="destructive">Live Now</Badge>}
                {exhibition.isVirtual && <Badge variant="outline">Virtual Exhibition</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{exhibition.title}</h1>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">About This Exhibition</h2>
                <p className="text-gray-700 whitespace-pre-line">{exhibition.description}</p>
              </div>
              
              <Separator />
              
              <div>
                <h2 className="text-2xl font-semibold mb-4">Featured Artists</h2>
                <div className="flex flex-wrap gap-2">
                  {exhibition.featuredArtists.map((artist: string, index: number) => (
                    <Badge key={index} variant="secondary">{artist}</Badge>
                  ))}
                </div>
              </div>
              
              {exhibition.isVirtual && isOngoing && (
                <>
                  <Separator />
                  
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Live Chat</h2>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 h-64 overflow-y-auto">
                      {exhibition.chatMessages && exhibition.chatMessages.length > 0 ? (
                        <div className="space-y-3">
                          {exhibition.chatMessages.map((chat: any) => (
                            <div key={chat.id} className="flex gap-2">
                              <div className="font-semibold">{chat.username}:</div>
                              <div className="flex-grow">{chat.message}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500">No messages yet. Be the first to chat!</p>
                      )}
                    </div>
                    
                    {isAuthenticated ? (
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Textarea
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-grow resize-none"
                          rows={1}
                        />
                        <Button type="submit" disabled={!newMessage.trim()}>Send</Button>
                      </form>
                    ) : (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="mb-2">Please sign in to join the conversation</p>
                        <Button asChild>
                          <Link to="/login">Sign In</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Event Details</h3>
                  <Separator className="mb-4" />
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium">Dates</p>
                        <p>
                          {new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium">Time</p>
                        <p>
                          {new Date(exhibition.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(exhibition.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p>{exhibition.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Users className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium">Attendees</p>
                        <p>{exhibition.attendees} people attending</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MessageSquare className="h-5 w-5 mr-2 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium">Organizer</p>
                        <p>{exhibition.organizer}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {(isUpcoming || isOngoing) && (
                  <Button 
                    className="w-full" 
                    variant={attending ? "outline" : "default"}
                    onClick={handleAttendToggle}
                  >
                    {attending ? "Cancel Attendance" : (isOngoing && exhibition.isVirtual) ? "Join Now" : "Attend"}
                  </Button>
                )}
              </div>
              
              {isOngoing && exhibition.isVirtual && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <Button className="w-full" disabled={!isAuthenticated}>
                    Enter Virtual Exhibition
                  </Button>
                  
                  {!isAuthenticated && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Please <Link to="/login" className="text-blue-500 hover:underline">sign in</Link> to enter the virtual exhibition.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExhibitionDetailPage;
