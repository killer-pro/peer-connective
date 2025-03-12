
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Phone, Users, Clock, Settings, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const SidebarLink = ({ 
  icon: Icon, 
  label, 
  active = false,
  collapsed = false,
  onClick 
}: { 
  icon: React.ComponentType<any>; 
  label: string; 
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}) => {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full justify-start gap-3 px-3 transition-all duration-200 rounded-xl",
        active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50",
        collapsed ? "py-3" : "py-2"
      )}
    >
      <Icon className={cn("h-5 w-5", collapsed && "mx-auto")} />
      {!collapsed && <span>{label}</span>}
    </Button>
  );
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const isMobile = useIsMobile();
  
  const menuItems = [
    { icon: Video, label: "Dashboard" },
    { icon: Phone, label: "Calls" },
    { icon: Users, label: "Contacts" },
    { icon: Calendar, label: "Schedule" },
    { icon: Clock, label: "History" },
    { icon: Settings, label: "Settings" },
  ];

  // Auto-collapse sidebar on mobile
  if (isMobile && !collapsed) {
    setCollapsed(true);
  }

  return (
    <aside
      className={cn(
        "h-screen transition-all duration-300 bg-sidebar border-r border-sidebar-border sticky top-0 left-0 z-30 flex flex-col shadow-sm",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <h2 className="text-xl font-semibold text-sidebar-foreground">
            Peer Connect
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-sidebar-foreground hover:bg-sidebar-accent/50",
            collapsed && "mx-auto"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <SidebarLink
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={activeItem === item.label}
              collapsed={collapsed}
              onClick={() => setActiveItem(item.label)}
            />
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground">
            U
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                User Name
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                user@example.com
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
