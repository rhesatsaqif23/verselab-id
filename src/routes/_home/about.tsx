// About route: renders the about page.
import { createFileRoute } from '@tanstack/react-router'
import AboutPage from '../../features/about'

export const Route = createFileRoute('/_home/about')({ component: AboutPage })