
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users } from "lucide-react";

interface ExhibitionProps {
  exhibition: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
    isVirtual: boolean;
    attendees: number;
  };
}

const ExhibitionCard = ({ exhibition }: ExhibitionProps) => {
  const isUpcoming = new Date(exhibition.startDate) > new Date();
  const isOngoing = new Date(exhibition.startDate) <= new Date() && new Date(exhibition.endDate) >= new Date();
  
  return (
    <Card className="h-full flex flex-col">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={exhibition.imageUrl} 
          alt={exhibition.title} 
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {isUpcoming && <Badge>Upcoming</Badge>}
          {isOngoing && <Badge variant="destructive">Live Now</Badge>}
          {exhibition.isVirtual && <Badge variant="outline">Virtual</Badge>}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2">{exhibition.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Calendar className="mr-1 h-4 w-4" />
          <span>
            {new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Users className="mr-1 h-4 w-4" />
          <span>{exhibition.attendees} attendees</span>
        </div>
        
        <p className="text-sm line-clamp-3 mb-4">
          {exhibition.description}
        </p>
      </CardContent>
      
      <CardFooter>
        <Button className="w-full" asChild>
          <Link to={`/exhibitions/${exhibition.id}`}>
            {isUpcoming ? "Get Notified" : isOngoing ? "Join Now" : "View Details"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExhibitionCard;
