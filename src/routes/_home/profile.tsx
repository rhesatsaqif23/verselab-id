// Profile route: renders the profile page.
import { createFileRoute } from '@tanstack/react-router'
import ProfilePage from '../../features/profile'

export const Route = createFileRoute('/_home/profile')({ component: ProfilePage })
