"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Server,
  Building,
  BarChart3,
  Settings,
  Shield,
  Globe,
  Database,
  AlertTriangle,
  CreditCard,
  GraduationCap,
  HomeIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";

const superAdminNavItems = [
  {
    title: "System Overview",
    button: <LayoutDashboard />,
    url: "/dashboard/superadmin",
  },
  {
    title: "Admin Management",
    button: <Shield />,
    url: "/dashboard/superadmin/admins",
  },
  {
    title: "All Users",
    button: <Users />,
    url: "/dashboard/superadmin/all-users",
  },
  {
    title: "Audit Logs",
    button: <HomeIcon />,
    url: "/dashboard/superadmin/audit-logs",
  },
  {
    title: "System Configuration",
    button: <Settings />,
    url: "/dashboard/superadmin/system-config",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isActive, setIsActive] = React.useState("Home");
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex gap-3 py-3">
          <GraduationCap />
          Super Admin
        </div>
        <Separator />
        {/* <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {superAdminNavItems.map((el) => (
                <SidebarMenuItem key={el.title}>
                  <Link href={el.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={el.title === isActive}
                      onClick={() => setIsActive(el.title)}
                    >
                      <span>
                        {el.button}
                        {el.title}
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter className="flex ml-auto lg:fixed bottom-5 right-5">
          <Select>
            <SelectTrigger className="text-black">
              Account <SettingsIcon />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Profile">Profile</SelectItem>
              <SelectItem value="Settings">Settings</SelectItem>
              <SelectItem value="Help">Help</SelectItem>
            </SelectContent>
          </Select>
        </SidebarFooter>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
