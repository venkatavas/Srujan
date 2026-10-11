'use client'

// The supplied LimelightNav demo, kept for reference. Not routed.

import { Bookmark, Home, PlusCircle, Settings, User } from 'lucide-react'
import { LimelightNav, type NavItem } from '@/components/ui/limelight-nav'

const customNavItems: NavItem[] = [
  { id: 'home', icon: <Home />, label: 'Home', onClick: () => console.log('Home Clicked!') },
  { id: 'bookmark', icon: <Bookmark />, label: 'Bookmarks', onClick: () => console.log('Bookmark Clicked!') },
  { id: 'add', icon: <PlusCircle />, label: 'Add New', onClick: () => console.log('Add Clicked!') },
  { id: 'profile', icon: <User />, label: 'Profile', onClick: () => console.log('Profile Clicked!') },
  { id: 'settings', icon: <Settings />, label: 'Settings', onClick: () => console.log('Settings Clicked!') },
]

export const Customized = () => {
  return <LimelightNav className="bg-secondary dark:bg-card/50 dark:border-accent/50 rounded-xl" items={customNavItems} />
}

export const Default = () => {
  return <LimelightNav />
}
