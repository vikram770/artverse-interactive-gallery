
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExhibitionCard from './ExhibitionCard';

// Sample exhibition data
const sampleExhibitions = [
  {
    id: "1",
    title: "Modern Art: A Digital Experience",
    description: "Explore the boundaries of modern art in this fully virtual exhibition featuring works from contemporary artists around the globe.",
    imageUrl: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80",
    startDate: "2025-05-10T10:00:00Z",
    endDate: "2025-06-30T18:00:00Z",
    isVirtual: true,
    attendees: 243
  },
  {
    id: "2",
    title: "Impressions: Light & Color",
    description: "A celebration of Impressionist techniques and their influence on contemporary digital art.",
    imageUrl: "https://images.unsplash.com/photo-1577083288073-40892c0860a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    startDate: "2025-04-01T09:00:00Z",
    endDate: "2025-04-30T17:00:00Z",
    isVirtual: true,
    attendees: 178
  },
  {
    id: "3",
    title: "Abstract Realities",
    description: "Dive into the world of abstract art and explore how artists interpret reality through non-representational forms.",
    imageUrl: "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80",
    startDate: "2025-07-15T11:00:00Z",
    endDate: "2025-08-20T19:00:00Z",
    isVirtual: false,
    attendees: 0
  },
  {
    id: "4",
    title: "Digital Frontiers",
    description: "An exploration of how technology is shaping the future of art creation, curation, and consumption.",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
    startDate: "2024-01-01T10:00:00Z",
    endDate: "2024-02-28T18:00:00Z",
    isVirtual: true,
    attendees: 506
  }
];

const Exhibitions = () => {
  const [exhibitions, setExhibitions] = useState(sampleExhibitions);
  const [activeTab, setActiveTab] = useState("all");
  
  const now = new Date();
  
  const filteredExhibitions = exhibitions.filter(exhibition => {
    const startDate = new Date(exhibition.startDate);
    const endDate = new Date(exhibition.endDate);
    
    if (activeTab === "all") return true;
    if (activeTab === "upcoming") return startDate > now;
    if (activeTab === "ongoing") return startDate <= now && endDate >= now;
    if (activeTab === "past") return endDate < now;
    if (activeTab === "virtual") return exhibition.isVirtual;
    
    return true;
  });
  
  // Initialize exhibitions from local storage in a real app
  useEffect(() => {
    // Load exhibitions from localStorage in the real implementation
    // For now we'll use the sample data
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-display mb-8">Exhibitions & Events</h1>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="virtual">Virtual</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {filteredExhibitions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">No exhibitions found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExhibitions.map(exhibition => (
                <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Exhibitions;
