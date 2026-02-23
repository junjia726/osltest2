import { NavLink } from "react-router";
import { Home, Car, Calculator, User, Users } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/sa-list", icon: Users, label: "Advisors" },
  { to: "/models", icon: Car, label: "Models" },
  { to: "/calculator", icon: Calculator, label: "Calculator" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border">
      <div className="max-w-[430px] mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <item.icon className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
