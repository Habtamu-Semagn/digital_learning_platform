"use client";
import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Separator } from "../../ui/separator";
import {
  BookOpen,
  GraduationCap,
  Home,
  Library,
  SettingsIcon,
  FileText,
  HelpCircle,
  Megaphone,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../../ui/select";
import Link from "next/link";

const navItem = [
  { title: "Dashboard", button: <Home />, url: "/dashboard/student" },
  {
    title: "My Courses",
    button: <BookOpen />,
    url: "/dashboard/student/courses",
  },
  {
    title: "Assignments",
    button: <FileText />,
    url: "/dashboard/student/assignments",
  },
  {
    title: "Announcements",
    button: <Megaphone />,
    url: "/dashboard/student/announcements",
  },
  { title: "Library", button: <Library />, url: "/dashboard/student/library" },
  {
    title: "Q&A",
    button: <HelpCircle />,
    url: "/dashboard/student/qa",
  },
  {
    title: "Settings",
    button: <SettingsIcon />,
    url: "/dashboard/student/settings",
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isActive, setIsActive] = React.useState("Dashboard");
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex gap-3 py-3">
          <GraduationCap />
          Student
        </div>
        <Separator />
        {/* <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {navItem.map((el) => (
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
