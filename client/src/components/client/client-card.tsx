import { type Client } from "@shared/schema";
import { Mail, Phone, FileText } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ClientCardProps {
  client: Client;
  compact?: boolean;
}

export default function ClientCard({ client, compact = false }: ClientCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (compact) {
    return (
      <div className="flex items-center p-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(client.first_name, client.last_name)}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {client.first_name} {client.last_name}
          </p>
          {client.email && (
            <p className="text-xs text-gray-500 truncate">{client.email}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <Avatar className="h-12 w-12">
        <AvatarFallback className="bg-primary text-primary-foreground">
          {getInitials(client.first_name, client.last_name)}
        </AvatarFallback>
      </Avatar>
      <div className="ml-4 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {client.first_name} {client.last_name}
            </h3>
            <div className="mt-1 flex flex-col text-xs text-gray-500 sm:flex-row sm:space-x-4">
              {client.email && (
                <div className="flex items-center">
                  <Mail className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center mt-1 sm:mt-0">
                  <Phone className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.notes && (
                <div className="flex items-center mt-1 sm:mt-0">
                  <FileText className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400" />
                  <span className="truncate">Has notes</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {new Date(client.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
