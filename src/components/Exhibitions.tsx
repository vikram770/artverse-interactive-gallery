
import { Button } from "@/components/ui/button";
import { CalendarRange } from "lucide-react";

// Sample exhibitions data
const exhibitions = [
  {
    id: "1",
    title: "Contemporary Expressions",
    description: "A curated collection of modern abstract works from emerging artists.",
    imageUrl: "https://images.unsplash.com/photo-1594388744666-d18f1738c6f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80",
    startDate: "2023-10-15",
    endDate: "2023-11-20",
    featured: true,
    status: "upcoming"
  },
  {
    id: "2",
    title: "Natural Perspectives",
    description: "Exploring humanity's relationship with nature through various media.",
    imageUrl: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    startDate: "2023-09-01",
    endDate: "2023-10-10",
    featured: false,
    status: "ongoing"
  },
  {
    id: "3",
    title: "Digital Frontiers",
    description: "Pushing the boundaries of digital art and new media expressions.",
    imageUrl: "https://images.unsplash.com/photo-1573221566340-81bdde00e00b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1635&q=80",
    startDate: "2023-11-05",
    endDate: "2023-12-20",
    featured: true,
    status: "upcoming"
  },
  {
    id: "4",
    title: "Retrospective: Classical Revival",
    description: "A look back at the neo-classical movement of the early 21st century.",
    imageUrl: "https://images.unsplash.com/photo-1577720643272-265a133ec9ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
    startDate: "2023-08-10",
    endDate: "2023-09-25",
    featured: false,
    status: "past"
  }
];

// Function to format dates
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Function to determine badge color based on status
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'upcoming':
      return 'bg-blue-100 text-blue-800';
    case 'ongoing':
      return 'bg-green-100 text-green-800';
    case 'past':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const Exhibitions = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold font-display mb-2">Virtual Exhibitions</h1>
        <p className="text-gray-600 mb-8">
          Explore our curated virtual exhibitions featuring works from artists around the world.
        </p>
        
        <div className="space-y-8 mb-12">
          {exhibitions.map((exhibition) => (
            <div key={exhibition.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="md:flex">
                <div className="md:flex-shrink-0 md:w-1/3">
                  <img 
                    className="h-48 w-full object-cover md:h-full" 
                    src={exhibition.imageUrl} 
                    alt={exhibition.title} 
                  />
                </div>
                <div className="p-6 md:w-2/3">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold">{exhibition.title}</h2>
                    <span className={`text-xs px-2 py-1 rounded-full uppercase font-medium ${getStatusBadge(exhibition.status)}`}>
                      {exhibition.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <CalendarRange className="h-4 w-4 mr-1" />
                    <span>
                      {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-6">{exhibition.description}</p>
                  
                  <div className="flex space-x-3">
                    <Button>View Exhibition</Button>
                    {exhibition.status === 'ongoing' && (
                      <Button variant="outline">Join Live Event</Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Submit Your Exhibition Proposal</h2>
          <p className="text-gray-600 mb-6">
            Are you an artist or curator interested in hosting a virtual exhibition on ArtVerse?
            We welcome proposals for innovative and engaging digital exhibitions.
          </p>
          <Button>Contact Us</Button>
        </div>
      </div>
    </div>
  );
};

export default Exhibitions;
